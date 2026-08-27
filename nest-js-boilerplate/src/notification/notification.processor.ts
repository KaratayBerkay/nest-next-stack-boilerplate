import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NOTIFICATION_QUEUE } from './notification.constants';

interface FriendPostNotificationJob {
  type: 'FRIEND_POST';
  authorId: string;
  userIds: string[];
  title: string;
  postId: string;
}

type NotificationJob = FriendPostNotificationJob;

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notifications: NotificationService,
    private readonly realtime: RealtimeGateway,
  ) {
    super();
  }

  async process(job: Job<NotificationJob>): Promise<void> {
    switch (job.data.type) {
      case 'FRIEND_POST': {
        const { authorId, userIds, title, postId } = job.data;
        // Promise.all would reject on the first failure, leaving BullMQ's
        // retry re-run the FULL original userIds list — every recipient who
        // already got their Notification row on this attempt would get a
        // second, duplicate one on the retry. allSettled + shrinking the job
        // data to only the still-failing recipients makes a retry resume
        // instead of redo.
        const results = await Promise.allSettled(
          userIds.map((userId) =>
            this.notifications.create({
              userId,
              actorId: authorId,
              type: 'POST',
              title: 'New post from friend',
              body: title.length > 100 ? title.slice(0, 100) + '...' : title,
              payload: { postId },
            }),
          ),
        );
        const stillPending = userIds.filter(
          (_, i) => results[i]?.status === 'rejected',
        );
        if (stillPending.length > 0) {
          await job.updateData({ ...job.data, userIds: stillPending });
          const firstFailure = results.find(
            (r): r is PromiseRejectedResult => r.status === 'rejected',
          );
          throw firstFailure?.reason instanceof Error
            ? firstFailure.reason
            : new Error(
                `${stillPending.length}/${userIds.length} friend-post notifications failed to create`,
              );
        }
        this.realtime.emitToTopic('feed', {
          renew: 'Feed',
          type: 'New',
        });
        break;
      }
      default:
        this.logger.warn(
          `Unknown notification job type: ${String((job.data as unknown as Record<string, string>).type)}`,
        );
    }
  }
}
