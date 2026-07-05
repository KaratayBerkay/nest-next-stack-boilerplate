import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import {
  type ChargeInput,
  type ChargeResult,
  type PaymentProvider,
} from './payment-provider.interface';

function luhnCheck(num: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  async charge(input: ChargeInput): Promise<ChargeResult> {
    const providerRef = `mock_${randomBytes(8).toString('hex')}`;

    if (input.last4 === '4242') {
      return { approved: true, providerRef };
    }

    if (input.last4 === '0002') {
      return { approved: false, reason: 'generic_decline', providerRef };
    }

    if (input.last4 === '9995') {
      return {
        approved: false,
        reason: 'insufficient_funds',
        providerRef,
      };
    }

    if (!luhnCheck('4242' + input.last4)) {
      return { approved: false, reason: 'invalid_card', providerRef };
    }

    return { approved: true, providerRef };
  }
}
