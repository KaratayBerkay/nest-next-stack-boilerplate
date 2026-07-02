import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostEventsGateway } from './post-events.gateway';
import { NotificationService } from '../notification/notification.service';
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
    private readonly postEvents: PostEventsGateway,
    private readonly notifications: NotificationService,
  ) {}

  async create(authorId: string, data: CreatePostInput) {
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

    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: authorId }, { addresseeId: authorId }],
      },
      select: { requesterId: true, addresseeId: true },
    });

    const friendIds = new Set<string>();
    for (const f of friendships) {
      if (f.requesterId !== authorId) friendIds.add(f.requesterId);
      if (f.addresseeId !== authorId) friendIds.add(f.addresseeId);
    }

    await Promise.all(
      [...friendIds].map((userId) =>
        this.notifications.create({
          userId,
          actorId: authorId,
          type: 'POST',
          title: 'New post from friend',
          body:
            data.title.length > 100
              ? data.title.slice(0, 100) + '...'
              : data.title,
          payload: { postId: post.id },
        }),
      ),
    );

    return post;
  }

  async update(id: string, authorId: string, data: UpdatePostInput) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post || post.deletedAt) throw new NotFoundException('Post not found');
    if (post.authorId !== authorId)
      throw new ForbiddenException('Not your post');

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
    this.postEvents.broadcastPostUpdate(id);
    return result;
  }

  async delete(id: string, authorId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post || post.deletedAt) throw new NotFoundException('Post not found');
    if (post.authorId !== authorId)
      throw new ForbiddenException('Not your post');

    const result = await this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    this.postEvents.broadcastPostUpdate(id);
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
    return this.prisma.post.findMany({
      take: take + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        reactions: true,
        _count: { select: { comments: true, reactions: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.post.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: true,
        comments: {
          where: { deletedAt: null },
          include: {
            author: true,
            reactions: true,
            _count: { select: { replies: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        reactions: {
          include: { user: true },
        },
        _count: { select: { comments: true, reactions: true } },
      },
    });
  }
}
