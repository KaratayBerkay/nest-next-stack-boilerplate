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
  }
}
