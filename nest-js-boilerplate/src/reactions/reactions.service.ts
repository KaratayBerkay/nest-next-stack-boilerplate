import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CacheAsideService } from '../caching/cache-aside.service';
import { CreateReactionInput } from './dto/create-reaction.input';

export type ReactionWithTarget = {
  id: string;
  userId: string;
  type: string;
  createdAt: Date;
  postId: string | null;
  commentId: string | null;
  post?: { authorId: string; title: string } | null;
  comment?: { authorId: string; postId: string } | null;
};

type CreateOutcome =
  | { kind: 'deleted'; reaction: ReactionWithTarget }
  | { kind: 'updated'; reaction: ReactionWithTarget }
  | { kind: 'created'; reaction: ReactionWithTarget };

const REACTION_INCLUDE = {
  post: { select: { authorId: true, title: true } },
  comment: { select: { authorId: true, postId: true } },
} as const;

@Injectable()
export class ReactionsService {
  private readonly logger = new Logger(ReactionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
    private readonly realtime: RealtimeGateway,
    private readonly cache: CacheAsideService,
  ) {}

  /** Scoped query — requires at least one of postId/commentId to prevent full-table scans. */
  findByTarget(postId?: string, commentId?: string) {
    if (!postId && !commentId) {
      throw new ConflictException(
        'At least one of postId or commentId is required',
      );
    }
    return this.prisma.reaction.findMany({
      where: {
        ...(postId ? { postId } : {}),
        ...(commentId ? { commentId } : {}),
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
  }

  async create(userId: string, data: CreateReactionInput) {
    const targetKey = data.postId ?? data.commentId ?? '';

    // Neither target was ever checked for existence/soft-deletion — Prisma's
    // `connect` only fails on a genuinely missing row (P2025), so reacting
    // to a soft-deleted post/comment silently succeeded: the reaction was
    // created, its (still-real) author got notified, and it would resurface
    // if the target were ever undeleted.
    if (data.postId) {
      const post = await this.prisma.post.findUnique({
        where: { id: data.postId },
        select: { deletedAt: true },
      });
      if (!post || post.deletedAt) {
        throw new NotFoundException('Post not found');
      }
    } else if (data.commentId) {
      const comment = await this.prisma.comment.findUnique({
        where: { id: data.commentId },
        select: { deletedAt: true },
      });
      if (!comment || comment.deletedAt) {
        throw new NotFoundException('Comment not found');
      }
    }

    const outcome = await this.prisma.$transaction(async (tx) => {
      // Serializes concurrent react/toggle attempts by this user against
      // this exact target. Necessary because @@unique([userId, postId,
      // commentId]) can never actually catch this race: postId/commentId
      // are always exactly-one-null per row (a post-reaction has
      // commentId: NULL and vice versa), and Postgres never treats two rows
      // as duplicates for a unique constraint when a constrained column is
      // NULL on either side — so two concurrent "react to the same post"
      // calls from the same user could otherwise both pass a plain
      // check-then-create and both insert, silently duplicating the
      // reaction and inflating its count. Locking here also makes the
      // existing-reaction update/delete branches below race-free against
      // each other (no separate P2025-on-concurrent-toggle handling needed).
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`reaction:${userId}:${targetKey}`}))`;

      const existing = await tx.reaction.findFirst({
        where: {
          userId,
          postId: data.postId ?? null,
          commentId: data.commentId ?? null,
        },
      });

      if (existing) {
        if (existing.type === data.type) {
          const deleted = (await tx.reaction.delete({
            where: { id: existing.id },
            include: REACTION_INCLUDE,
          })) as ReactionWithTarget;
          return { kind: 'deleted', reaction: deleted } satisfies CreateOutcome;
        }
        const updated = (await tx.reaction.update({
          where: { id: existing.id },
          data: { type: data.type },
          include: REACTION_INCLUDE,
        })) as ReactionWithTarget;
        return { kind: 'updated', reaction: updated } satisfies CreateOutcome;
      }

      let created: ReactionWithTarget;
      try {
        created = await tx.reaction.create({
          data: {
            type: data.type,
            user: { connect: { id: userId } },
            ...(data.postId && { post: { connect: { id: data.postId } } }),
            ...(data.commentId && {
              comment: { connect: { id: data.commentId } },
            }),
          },
          include: REACTION_INCLUDE,
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
      return { kind: 'created', reaction: created } satisfies CreateOutcome;
    });

    // The post to invalidate/broadcast for — resolved from the comment's own
    // postId when the target is a comment. Previously this fell back to
    // `data.postId`, which is always undefined for a comment reaction, so a
    // comment reaction/un-reaction/switch never invalidated cache or emitted
    // any realtime event at all (100% reproducible, not a race) while the
    // identical post-reaction path worked correctly.
    const { reaction } = outcome;
    const targetPostId = reaction.postId ?? reaction.comment?.postId ?? null;
    if (targetPostId) {
      // CacheAsideService catches and logs its own failures internally.
      void this.cache.invalidate(`cache:post:${targetPostId}`);
      void this.cache.invalidate('cache:feed:*');
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

    if (outcome.kind === 'created') {
      const targetAuthorId =
        reaction.post?.authorId ?? reaction.comment?.authorId;
      if (targetAuthorId && targetAuthorId !== userId) {
        const postTitle = reaction.post?.title ?? 'a comment';
        try {
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
        } catch (err) {
          // The reaction already committed successfully above — a
          // notification failure must not surface as an error for this
          // mutation (a client retrying on that error would hit the toggle
          // branch and delete the reaction it just made, believing it had
          // never landed).
          this.logger.error(
            'Failed to send reaction notification',
            err as Error,
          );
        }
      }
    }

    if (outcome.kind === 'deleted') return { ...reaction, deleted: true };
    return reaction;
  }
}
