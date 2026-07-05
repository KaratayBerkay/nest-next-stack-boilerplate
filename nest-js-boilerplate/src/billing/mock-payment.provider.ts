import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import {
  type ChargeInput,
  type ChargeResult,
  type PaymentProvider,
} from './payment-provider.interface';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  charge(input: ChargeInput): Promise<ChargeResult> {
    const providerRef = `mock_${randomBytes(8).toString('hex')}`;

    if (input.last4 === '4242') {
      return Promise.resolve({ approved: true, providerRef });
    }

    if (input.last4 === '0002') {
      return Promise.resolve({
        approved: false,
        reason: 'generic_decline',
        providerRef,
      });
    }

    if (input.last4 === '9995') {
      return Promise.resolve({
        approved: false,
        reason: 'insufficient_funds',
        providerRef,
      });
    }

    // Any last4 not in the documented decline list approves — the mock doesn't
    // use Luhn because you can't validate a 4-digit suffix in isolation.
    return Promise.resolve({ approved: true, providerRef });
  }
}
