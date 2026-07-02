import { Injectable } from '@nestjs/common';

export interface ConnectionOptions {
  readonly url: string;
}

// A normal class provider that the `useFactory` below depends on (via `inject`) — proving a
// factory can itself consume other providers to compute its result.
@Injectable()
export class OptionsProvider {
  get(): ConnectionOptions {
    return { url: 'postgres://localhost:5433/app' };
  }
}
