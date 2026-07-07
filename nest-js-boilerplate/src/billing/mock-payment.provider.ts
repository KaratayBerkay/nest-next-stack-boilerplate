import { Injectable } from '@nestjs/common';
import type {
  PaymentProvider,
  CreateSubscriptionInput,
  CreateSubscriptionResult,
} from './payment-provider.interface';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  async createSubscription(
    _input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult> {
    return {
      success: true,
      stripeSubscriptionId: `mock_sub_${Date.now()}`,
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      latestInvoiceId: `mock_inv_${Date.now()}`,
    };
  }

  async cancelSubscription(_stripeSubscriptionId: string): Promise<void> {
    // no-op
  }
}
