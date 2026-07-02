import { Inject, Injectable } from '@nestjs/common';
import { ASYNC_CONNECTION } from './tokens';
import type { AsyncConnection } from './async-connection';

// Injects the async provider by its token like any other provider. If Nest hadn't awaited the
// factory, this would receive a Promise and ping() would not exist — so a passing call proves
// the await happened before this provider was instantiated.
@Injectable()
export class ConnectionConsumerService {
  constructor(
    @Inject(ASYNC_CONNECTION) private readonly connection: AsyncConnection,
  ) {}

  check(): string {
    return this.connection.ping();
  }
}
