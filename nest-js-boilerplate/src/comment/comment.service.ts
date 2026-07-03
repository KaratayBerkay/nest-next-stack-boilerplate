import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PostEventsGateway } from '../post/post-events.gateway';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
    private readonly realtime: RealtimeGateway,
    private readonly postEvents: PostEventsGateway,
  ) {}

  async create(authorId: string, data: CreateCommentInput) {
    if (data.parentId) {
      const existing = await this.prisma.comment.findFirst({
        where: { authorId, parentId: data.parentId, deletedAt: null },
      });
      if (existing) {
        throw new Error('You have already replied to this comment');
      }
    }

    const comment = await this.prisma.comment.create({
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

    const post = await this.prisma.post.findUnique({
      where: { id: data.postId },
      select: { authorId: true, title: true },
    });

    if (post && post.authorId !== authorId) {
      await this.notifications.create({
        userId: post.authorId,
        actorId: authorId,
        type: 'COMMENT',
        title: 'New comment on your post',
        body:
          data.body.length > 100 ? data.body.slice(0, 100) + '...' : data.body,
        payload: { postId: data.postId, commentId: comment.id },
      });
    }

    this.postEvents.broadcastPostUpdate(data.postId);
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
      throw new ForbiddenException('Not your comment');

    const updateData: Record<string, unknown> = { body: data.body };
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: updateData,
      include: { author: true },
    });

    this.postEvents.broadcastPostUpdate(comment.postId);
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
      throw new ForbiddenException('Not your comment');

    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    this.postEvents.broadcastPostUpdate(comment.postId);
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
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
