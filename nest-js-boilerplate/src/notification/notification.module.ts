import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FriendsModule } from '../friends/friends.module';
import { PushNotificationModule } from '../push-notification/push-notification.module';
import { SseModule } from '../sse/sse.module';
import { NotificationGateway } from './notification.gateway';
import { NotificationResolver } from './notification.resolver';
import { NotificationService } from './notification.service';
import { WsNotificationBridge } from './ws-notification-bridge.service';

@Module({
  imports: [AuthModule, FriendsModule, PushNotificationModule, SseModule],
  controllers: [],
  providers: [
    NotificationGateway,
    NotificationResolver,
    NotificationService,
    WsNotificationBridge,
  ],
  exports: [NotificationGateway, NotificationService, WsNotificationBridge],
})
export class NotificationModule {}
