import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendsService } from '../friends/friends.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationService } from '../notification/notification.service';
import { NotificationQueueService } from '../notification/notification-queue.service';
import { CacheAsideService } from '../caching/cache-aside.service';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100) || 'post'
  );
}

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly friends: FriendsService,
    private readonly realtime: RealtimeGateway,
    private readonly notifications: NotificationService,
    private readonly notificationQueue: NotificationQueueService,
    private readonly cache: CacheAsideService,
  ) {}

  async create(authorId: string, data: CreatePostInput, friendIds?: string[]) {
    const baseSlug = slugify(data.title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const post = await this.prisma.post.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        coverImage: data.coverImage ? Buffer.from(data.coverImage) : undefined,
        imageUrl: data.imageUrl,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        author: { connect: { id: authorId } },
      },
      include: { author: true },
    });

    // Use the SessionAuthGuard snapshot when available (zero PG);
    // fall back to FriendsService only when absent/undefined.
    const ids = friendIds ?? (await this.friends.getFriendIds(authorId));

    this.cache.invalidate('cache:feed:*').catch(() => {});
    this.notificationQueue
      .enqueueFriendPostNotification(authorId, ids, data.title, post.id)
      .catch(() => {});

    return post;
  }

  async update(id: string, authorId: string, data: UpdatePostInput) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post || post.deletedAt) throw new NotFoundException('Post not found');
    if (post.authorId !== authorId)
      throw new ForbiddenException({
        exc: 'EX_FORBIDDEN',
        msg: 'Not your post',
        key: 'error.notYourPost',
      });

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.coverImage !== undefined) {
      updateData.coverImage = data.coverImage
        ? Buffer.from(data.coverImage)
        : null;
    }
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl;
    }

    const result = await this.prisma.post.update({
      where: { id },
      data: updateData,
      include: { author: true },
    });
    this.cache.invalidate(`cache:post:${id}`).catch(() => {});
    this.cache.invalidate('cache:feed:*').catch(() => {});
    this.realtime.emitToTopic('feed', {
      renew: 'Feed',
      type: 'Post',
      id,
    });
    this.realtime.emitToTopic(`post:${id}`, {
      renew: 'Feed',
      type: 'Post',
      id,
    });
    return result;
  }

  async delete(id: string, authorId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post || post.deletedAt) throw new NotFoundException('Post not found');
    if (post.authorId !== authorId)
      throw new ForbiddenException({
        exc: 'EX_FORBIDDEN',
        msg: 'Not your post',
        key: 'error.notYourPost',
      });

    const result = await this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    this.realtime.emitToTopic('feed', {
      renew: 'Feed',
      type: 'Post',
      id,
    });
    this.realtime.emitToTopic(`post:${id}`, {
      renew: 'Feed',
      type: 'Post',
      id,
    });
    return result;
  }

  async findAll(cursor?: string, take = 20, search?: string) {
    const where: Record<string, unknown> = {
      deletedAt: null,
      status: 'PUBLISHED',
    };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    const cacheKey = `cache:feed:${cursor ?? ''}:${take}:${search ?? ''}`;
    return this.cache.getOrFetch(
      cacheKey,
      () =>
        this.prisma.post.findMany({
          take: take + 1,
          ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
          where,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            content: true,
            imageUrl: true,
            createdAt: true,
            status: true,
            author: {
              select: { id: true, name: true, email: true },
            },
            reactions: {
              take: 50,
              select: { id: true, type: true, userId: true },
            },
            _count: { select: { comments: true, reactions: true } },
          },
        }),
      30,
    );
  }

  async findOne(id: string) {
    const cacheKey = `cache:post:${id}`;
    return this.cache.getOrFetch(
      cacheKey,
      () =>
        this.prisma.post.findFirst({
          where: { id, deletedAt: null },
          select: {
            id: true,
            title: true,
            content: true,
            imageUrl: true,
            coverImage: true,
            createdAt: true,
            status: true,
            author: {
              select: { id: true, name: true, email: true },
            },
            comments: {
              where: { deletedAt: null, parentId: null },
              take: 20,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                body: true,
                createdAt: true,
                authorId: true,
                author: {
                  select: { id: true, name: true, email: true },
                },
                reactions: {
                  take: 50,
                  select: { id: true, type: true, userId: true },
                },
                _count: { select: { replies: true } },
              },
            },
            reactions: {
              take: 100,
              select: { id: true, type: true, userId: true },
            },
            _count: { select: { comments: true, reactions: true } },
          },
        }),
      60,
    );
  }

  async getMyPostStats(userId: string) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId, deletedAt: null, status: 'PUBLISHED' },
      select: { _count: { select: { reactions: true } } },
    });
    const totalPosts = posts.length;
    const totalReactions = posts.reduce(
      (sum, p) => sum + p._count.reactions,
      0,
    );
    return {
      totalPosts,
      totalReactions,
      avgReactionsPerPost: totalPosts > 0 ? totalReactions / totalPosts : 0,
    };
  }
}
