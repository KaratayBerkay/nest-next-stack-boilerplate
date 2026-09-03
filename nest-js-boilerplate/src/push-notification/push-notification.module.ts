import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthContractsModule } from '../auth/auth-contracts.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PushNotificationController } from './push-notification.controller';
import { PushNotificationService } from './push-notification.service';
import { PushSubscriptionResolver } from './push-subscription.resolver';
import { PushSubscriptionService } from './push-subscription.service';

@Module({
  imports: [AuthContractsModule, PrismaModule, ConfigModule],
  controllers: [PushNotificationController],
  providers: [
    PushNotificationService,
    PushSubscriptionResolver,
    PushSubscriptionService,
  ],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}
