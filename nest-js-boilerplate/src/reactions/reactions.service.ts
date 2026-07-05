import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateReactionInput } from './dto/create-reaction.input';

export type ReactionWithTarget = {
  id: string;
  userId: string;
  type: string;
  createdAt: Date;
  postId: string | null;
  commentId: string | null;
  post?: { authorId: string; title: string } | null;
  comment?: { authorId: string } | null;
};

@Injectable()
export class ReactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
    private readonly realtime: RealtimeGateway,
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
        if (targetPostId) {
          this.realtime.emitToTopic('feed', {
            renew: 'Feed',
            type: 'Post',
            id: targetPostId,
          });
          this.realtime.emitToTopic(`post:${targetPostId}`, {
            renew: 'Feed',
            type: 'Post',
            id: targetPostId,
          });
        }
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
      if (targetPostId) {
        this.realtime.emitToTopic('feed', {
          renew: 'Feed',
          type: 'Post',
          id: targetPostId,
        });
        this.realtime.emitToTopic(`post:${targetPostId}`, {
          renew: 'Feed',
          type: 'Post',
          id: targetPostId,
        });
      }
      return updated;
    }

    let reaction: ReactionWithTarget;
    try {
      reaction = await this.prisma.reaction.create({
        data: {
          type: data.type,
          user: { connect: { id: userId } },
          ...(data.postId && { post: { connect: { id: data.postId } } }),
          ...(data.commentId && {
            comment: { connect: { id: data.commentId } },
          }),
        },
        include: {
          post: { select: { authorId: true, title: true } },
          comment: { select: { authorId: true } },
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Reaction already exists');
      }
      throw err;
    }

    if (data.postId) {
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
    }

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
