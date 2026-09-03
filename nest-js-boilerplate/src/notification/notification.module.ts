import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthContractsModule } from '../auth/auth-contracts.module';
import { PushNotificationModule } from '../push-notification/push-notification.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { NOTIFICATION_QUEUE } from './notification.constants';
import { NotificationProcessor } from './notification.processor';
import { NotificationQueueService } from './notification-queue.service';
import { NotificationResolver } from './notification.resolver';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    // Only the guard + TokenStoreService contracts — importing AuthModule
    // itself would make AuthModule -> NotificationModule (SECURITY
    // notifications) a hard cycle.
    AuthContractsModule,
    PushNotificationModule,
    RealtimeModule,
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
  ],
  providers: [
    NotificationResolver,
    NotificationService,
    NotificationProcessor,
    NotificationQueueService,
  ],
  exports: [NotificationService, NotificationQueueService],
})
export class NotificationModule {}
