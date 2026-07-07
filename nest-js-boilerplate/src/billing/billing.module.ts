import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { BillingResolver } from './billing.resolver';
import { BillingService } from './billing.service';
import { StripePaymentProvider } from './stripe-payment.provider';
import { StripeWebhookController } from './stripe-webhook.controller';
import { PAYMENT_PROVIDER } from './payment-provider.interface';

@Module({
  imports: [AuthModule, NotificationModule, RealtimeModule],
  controllers: [StripeWebhookController],
  providers: [
    BillingResolver,
    BillingService,
    {
      provide: PAYMENT_PROVIDER,
      useClass: StripePaymentProvider,
    },
  ],
  exports: [BillingService],
})
export class BillingModule {}
