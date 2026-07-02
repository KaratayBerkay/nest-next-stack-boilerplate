import { Injectable } from '@nestjs/common';

/** A cat owned by a user — the read model the ALS-scoped service returns. */
export interface Cat {
  userId: string;
  name: string;
}

/**
 * Async Local Storage (#118) — stand-in data source (the docs' `CatsRepository`). It never sees
 * the request: it is handed a `userId` that the service pulled out of the ALS store, proving the
 * identity propagated implicitly rather than via a method/route parameter.
 */
@Injectable()
export class CatsRepository {
  private readonly catsByUser: Record<string, Cat> = {
    '42': { userId: '42', name: 'Garfield' },
    '7': { userId: '7', name: 'Felix' },
  };

  getForUser(userId: string): Cat {
    return this.catsByUser[userId] ?? { userId, name: 'Stray' };
  }
}
