import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { PostModule } from '../post/post.module';
import { ReactionsResolver } from './reactions.resolver';
import { ReactionsService } from './reactions.service';

@Module({
  imports: [AuthModule, NotificationModule, PostModule],
  providers: [ReactionsResolver, ReactionsService],
})
export class ReactionsModule {}
