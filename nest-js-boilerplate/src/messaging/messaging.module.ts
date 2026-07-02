import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MessagingResolver } from './messaging.resolver';
import { MessagingService } from './messaging.service';
import { MessagingWsGateway } from './messaging-ws.gateway';
import { MessagingController } from './messaging.controller';

@Module({
  imports: [AuthModule, CacheModule.register()],
  controllers: [MessagingController],
  providers: [MessagingResolver, MessagingService, MessagingWsGateway],
})
export class MessagingModule {}
