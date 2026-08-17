import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { NOTIFICATION_QUEUE } from './notification.constants';

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(@InjectQueue(NOTIFICATION_QUEUE) private readonly queue: Queue) {}

  async enqueueFriendPostNotification(
    authorId: string,
    userIds: string[],
    title: string,
    postId: string,
  ): Promise<void> {
    if (userIds.length === 0) return;
    try {
      await this.queue.add(
        'friend-post',
        {
          type: 'FRIEND_POST',
          authorId,
          userIds,
          title,
          postId,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      );
    } catch (err) {
      // Best-effort — a post is already created; a friend-notification enqueue
      // failure must never fail the request, just be visible that it happened.
      this.logger.warn({
        category: 'notification',
        event: 'notification.enqueue_failed',
        jobType: 'friend-post',
        authorId,
        postId,
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
