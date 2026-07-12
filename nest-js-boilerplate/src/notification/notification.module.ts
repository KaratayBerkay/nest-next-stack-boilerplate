import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PushNotificationModule } from '../push-notification/push-notification.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { NOTIFICATION_QUEUE } from './notification.constants';
import { NotificationController } from './notification.controller';
import { NotificationProcessor } from './notification.processor';
import { NotificationQueueService } from './notification-queue.service';
import { NotificationResolver } from './notification.resolver';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    AuthModule,
    PushNotificationModule,
    RealtimeModule,
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationResolver,
    NotificationService,
    NotificationProcessor,
    NotificationQueueService,
  ],
  exports: [NotificationService, NotificationQueueService],
})
export class NotificationModule {}
