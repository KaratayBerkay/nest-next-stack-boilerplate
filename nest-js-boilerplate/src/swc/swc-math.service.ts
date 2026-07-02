import { Injectable } from '@nestjs/common';

/**
 * A trivial provider whose only job is to be injected *by type* into the
 * controller (#103 SWC). If SWC dropped the `design:paramtypes` decorator
 * metadata, Nest couldn't resolve this from the constructor and the proof
 * test's DI would fail — so the service computing a real value is the proof
 * that SWC's `decoratorMetadata: true` worked.
 */
@Injectable()
export class SwcMathService {
  sum(numbers: number[]): number {
    return numbers.reduce((acc, n) => acc + n, 0);
  }
}
