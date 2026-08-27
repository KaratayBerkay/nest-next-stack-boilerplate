import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { ReactionsResolver } from './reactions.resolver';
import { ReactionsService } from './reactions.service';

@Module({
  imports: [AuthModule, NotificationModule, RealtimeModule],
  providers: [ReactionsResolver, ReactionsService],
})
export class ReactionsModule {}
