import { Injectable } from '@nestjs/common';
import { PostEventsGateway } from '../post/post-events.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateReactionInput } from './dto/create-reaction.input';

@Injectable()
export class ReactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
    private readonly postEvents: PostEventsGateway,
  ) {}

  findAll() {
    return this.prisma.reaction.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async create(userId: string, data: CreateReactionInput) {
    const existing = await this.prisma.reaction.findFirst({
      where: {
        userId,
        postId: data.postId ?? null,
        commentId: data.commentId ?? null,
      },
    });

    if (existing) {
      const targetPostId = existing.postId ?? data.postId;
      if (existing.type === data.type) {
        await this.prisma.reaction.delete({ where: { id: existing.id } });
        if (targetPostId) this.postEvents.broadcastPostUpdate(targetPostId);
        return { ...existing, deleted: true };
      }
      const updated = await this.prisma.reaction.update({
        where: { id: existing.id },
        data: { type: data.type },
        include: {
          post: { select: { authorId: true, title: true } },
          comment: { select: { authorId: true } },
        },
      });
      if (targetPostId) this.postEvents.broadcastPostUpdate(targetPostId);
      return updated;
    }

    const reaction = await this.prisma.reaction.create({
      data: {
        type: data.type,
        user: { connect: { id: userId } },
        ...(data.postId && { post: { connect: { id: data.postId } } }),
        ...(data.commentId && { comment: { connect: { id: data.commentId } } }),
      },
      include: {
        post: { select: { authorId: true, title: true } },
        comment: { select: { authorId: true } },
      },
    });

    if (data.postId) this.postEvents.broadcastPostUpdate(data.postId);

    const targetAuthorId =
      reaction.post?.authorId ?? reaction.comment?.authorId;
    if (targetAuthorId && targetAuthorId !== userId) {
      const postTitle = reaction.post?.title ?? 'a comment';
      await this.notifications.create({
        userId: targetAuthorId,
        actorId: userId,
        type: 'REACTION',
        title: `${data.type.toLowerCase()} on your post`,
        body: `Someone reacted with ${data.type.toLowerCase()} to "${postTitle.length > 50 ? postTitle.slice(0, 50) + '...' : postTitle}"`,
        payload: {
          postId: data.postId,
          commentId: data.commentId,
          reactionType: data.type,
        },
      });
    }

    return reaction;
  }
}
