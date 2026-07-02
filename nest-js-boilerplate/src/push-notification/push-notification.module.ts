import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PushNotificationService } from './push-notification.service';
import { PushSubscriptionResolver } from './push-subscription.resolver';
import { PushSubscriptionService } from './push-subscription.service';

@Module({
  imports: [AuthModule, PrismaModule, ConfigModule],
  providers: [
    PushNotificationService,
    PushSubscriptionResolver,
    PushSubscriptionService,
  ],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}
