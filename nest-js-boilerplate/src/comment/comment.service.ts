import {
  ConflictException,
  Injectable,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CacheAsideService } from '../caching/cache-aside.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
    private readonly realtime: RealtimeGateway,
    private readonly cache: CacheAsideService,
  ) {}

  async create(authorId: string, data: CreateCommentInput) {
    const post = await this.prisma.post.findUnique({
      where: { id: data.postId },
      select: { authorId: true, title: true, deletedAt: true },
    });
    // Unlike update()/delete() in this same file, this previously never
    // checked deletedAt at all — a comment could be attached to a
    // soft-deleted post.
    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    if (data.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: data.parentId },
        select: { postId: true, deletedAt: true },
      });
      // Previously connected to `parent` without ever checking the parent's
      // own postId matched data.postId — a reply could be persisted under a
      // different post than its actual parent thread, an invariant enforced
      // by neither the application nor the database.
      if (!parent || parent.deletedAt || parent.postId !== data.postId) {
        throw new NotFoundException('Comment not found');
      }
    }

    const comment = await this.prisma.$transaction(async (tx) => {
      if (data.parentId) {
        // Serializes concurrent "reply to this exact parent" attempts by
        // this author — there's no @@unique([authorId, parentId]) backing
        // the one-reply-per-parent rule, so two concurrent replies from the
        // same user to the same parent could otherwise both pass this
        // check-then-create and both get created.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`comment-reply:${authorId}:${data.parentId}`}))`;

        const existingReply = await tx.comment.findFirst({
          where: { authorId, parentId: data.parentId, deletedAt: null },
        });
        if (existingReply) {
          throw new ConflictException({
            exc: 'EX_CONFLICT_DUPLICATE',
            msg: 'You have already replied to this comment',
            key: 'error.commentDuplicateReply',
          });
        }
      }

      return tx.comment.create({
        data: {
          body: data.body,
          imageUrl: data.imageUrl,
          author: { connect: { id: authorId } },
          post: { connect: { id: data.postId } },
          ...(data.parentId && {
            parent: { connect: { id: data.parentId } },
          }),
        },
        include: {
          author: true,
          post: { select: { authorId: true, title: true } },
        },
      });
    });

    if (post.authorId !== authorId) {
      try {
        await this.notifications.create({
          userId: post.authorId,
          actorId: authorId,
          type: 'COMMENT',
          title: 'New comment on your post',
          body:
            data.body.length > 100
              ? data.body.slice(0, 100) + '...'
              : data.body,
          payload: { postId: data.postId, commentId: comment.id },
        });
      } catch (err) {
        // The comment already committed successfully above — a
        // notification failure must not surface as an error for this
        // mutation (previously it would: this call was unguarded, so a
        // transient failure here both returned an error for an
        // already-saved comment AND skipped the cache/realtime
        // invalidation below entirely).
        this.logger.error('Failed to send comment notification', err as Error);
      }
    }

    // CacheAsideService catches and logs its own failures internally — it
    // never rejects, so there's nothing to swallow here.
    void this.cache.invalidate(`cache:post:${data.postId}`);
    void this.cache.invalidate('cache:feed:*');
    this.realtime.emitToTopic('feed', {
      renew: 'Feed',
      type: 'Post',
      id: data.postId,
    });
    this.realtime.emitToTopic(`post:${data.postId}`, {
      renew: 'Feed',
      type: 'Post',
      id: data.postId,
    });
    return comment;
  }

  async update(commentId: string, authorId: string, data: UpdateCommentInput) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment || comment.deletedAt)
      throw new NotFoundException('Comment not found');
    if (comment.authorId !== authorId)
      throw new ForbiddenException({
        exc: 'EX_FORBIDDEN',
        msg: 'Not your comment',
        key: 'error.notYourComment',
      });

    const updateData: Record<string, unknown> = { body: data.body };
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: updateData,
      include: { author: true },
    });

    void this.cache.invalidate(`cache:post:${comment.postId}`);
    void this.cache.invalidate('cache:feed:*');
    this.realtime.emitToTopic('feed', {
      renew: 'Feed',
      type: 'Post',
      id: comment.postId,
    });
    this.realtime.emitToTopic(`post:${comment.postId}`, {
      renew: 'Feed',
      type: 'Post',
      id: comment.postId,
    });
    return updated;
  }

  async delete(commentId: string, authorId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment || comment.deletedAt)
      throw new NotFoundException('Comment not found');
    if (comment.authorId !== authorId)
      throw new ForbiddenException({
        exc: 'EX_FORBIDDEN',
        msg: 'Not your comment',
        key: 'error.notYourComment',
      });

    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    void this.cache.invalidate(`cache:post:${comment.postId}`);
    void this.cache.invalidate('cache:feed:*');
    this.realtime.emitToTopic('feed', {
      renew: 'Feed',
      type: 'Post',
      id: comment.postId,
    });
    this.realtime.emitToTopic(`post:${comment.postId}`, {
      renew: 'Feed',
      type: 'Post',
      id: comment.postId,
    });
    return updated;
  }

  async findByPost(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId, deletedAt: null, parentId: null },
      include: {
        author: true,
        reactions: true,
        replies: {
          where: { deletedAt: null },
          include: { author: true, reactions: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
