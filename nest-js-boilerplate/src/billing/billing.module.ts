import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { BillingResolver } from './billing.resolver';
import { BillingService } from './billing.service';
import { MockPaymentProvider } from './mock-payment.provider';
import { PAYMENT_PROVIDER } from './payment-provider.interface';

@Module({
  imports: [AuthModule, NotificationModule],
  providers: [
    BillingResolver,
    BillingService,
    {
      provide: PAYMENT_PROVIDER,
      useClass: MockPaymentProvider,
    },
  ],
  exports: [BillingService],
})
export class BillingModule {}
