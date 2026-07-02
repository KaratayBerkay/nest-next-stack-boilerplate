import type { ConnectionOptions } from './options.provider';

// A plain (non-@Injectable) class instantiated by the `useFactory` provider — the kind of object
// Nest can't construct on its own, which is exactly why a factory provider exists.
export class DatabaseConnection {
  constructor(
    readonly options: ConnectionOptions,
    readonly optionalFlag: string | undefined,
  ) {}
}
