import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { PostEventsGateway } from './post-events.gateway';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';

@Module({
  imports: [AuthModule, NotificationModule],
  providers: [PostResolver, PostService, PostEventsGateway],
  exports: [PostService, PostEventsGateway],
})
export class PostModule {}
