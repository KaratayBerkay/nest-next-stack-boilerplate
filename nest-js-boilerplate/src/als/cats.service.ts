import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { AlsStore } from './als-store';
import { CatsRepository } from './cats.repository';
import type { Cat } from './cats.repository';

/**
 * Async Local Storage (#118) — the docs' `CatsService`. It receives no `userId` argument; instead
 * it reads the current request's identity from the injected {@link AsyncLocalStorage} store.
 *
 * The deliberate `await` before reading the store is the real proof of the API: `AsyncLocalStorage`
 * preserves the store across `await` boundaries *and* keeps it isolated per async context, so even
 * when many requests interleave on the event loop each one still reads its own `userId`.
 */
@Injectable()
export class CatsService {
  constructor(
    private readonly als: AsyncLocalStorage<AlsStore>,
    private readonly catsRepository: CatsRepository,
  ) {}

  async getCatForUser(): Promise<Cat> {
    // Yield to the event loop first: if the store leaked between concurrent requests, the read
    // below would observe another request's userId. It doesn't — that is the guarantee under test.
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 20));

    const store = this.als.getStore();
    if (!store) {
      // Reachable only if a caller invokes this outside the ALS middleware (e.g. a cron tick).
      throw new InternalServerErrorException(
        'No request context: called outside the ALS scope',
      );
    }
    return this.catsRepository.getForUser(store.userId);
  }
}
