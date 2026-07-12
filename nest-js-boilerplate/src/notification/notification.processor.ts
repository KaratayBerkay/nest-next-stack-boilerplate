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
        await Promise.all(
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
        this.realtime.emitToTopic('feed', {
          renew: 'Feed',
          type: 'New',
        });
        break;
      }
      default:
        this.logger.warn(
          `Unknown notification job type: ${String((job.data as Record<string, string>).type)}`,
        );
    }
  }
}
