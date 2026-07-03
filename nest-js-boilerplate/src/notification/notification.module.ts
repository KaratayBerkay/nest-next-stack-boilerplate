import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PushNotificationModule } from '../push-notification/push-notification.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { SseModule } from '../sse/sse.module';
import { NotificationGateway } from './notification.gateway';
import { NotificationResolver } from './notification.resolver';
import { NotificationService } from './notification.service';

@Module({
  imports: [AuthModule, PushNotificationModule, RealtimeModule, SseModule],
  controllers: [],
  providers: [NotificationGateway, NotificationResolver, NotificationService],
  exports: [NotificationGateway, NotificationService],
})
export class NotificationModule {}
