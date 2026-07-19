import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FriendsModule } from '../friends/friends.module';
import { NotificationModule } from '../notification/notification.module';
import { PushNotificationModule } from '../push-notification/push-notification.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { RedisModule } from '../redis/redis.module';
import { MessagingResolver } from './messaging.resolver';
import { MessagingService } from './messaging.service';
import { MessagingWsGateway } from './messaging-ws.gateway';
import { MessagingController } from './messaging.controller';

@Module({
  imports: [
    AuthModule,
    FriendsModule,
    NotificationModule,
    PushNotificationModule,
    RealtimeModule,
    RedisModule,
  ],
  controllers: [MessagingController],
  providers: [MessagingResolver, MessagingService, MessagingWsGateway],
  exports: [],
})
export class MessagingModule {}
