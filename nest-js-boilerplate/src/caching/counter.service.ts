import { Injectable } from '@nestjs/common';

/**
 * Singleton counter used to prove cache HITs skip the handler body: every *actual*
 * invocation bumps the count, so a cached response repeats the previous count while
 * a fresh (missed/expired) one returns a higher one.
 */
@Injectable()
export class CounterService {
  private calls = 0;

  next(): { value: number; servedAt: number } {
    return { value: ++this.calls, servedAt: Date.now() };
  }
}
