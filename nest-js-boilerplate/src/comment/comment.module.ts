import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { PostModule } from '../post/post.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';

@Module({
  imports: [AuthModule, NotificationModule, PostModule, RealtimeModule],
  providers: [CommentResolver, CommentService],
})
export class CommentModule {}
