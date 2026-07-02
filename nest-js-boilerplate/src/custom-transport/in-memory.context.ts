import { BaseRpcContext } from '@nestjs/microservices';

type InMemoryContextArgs = [pattern: string];

/**
 * custom transporter (#81) — the per-message execution context handed to handlers (via `@Ctx()`).
 * Mirrors the built-in `TcpContext`/`RedisContext` etc.: a thin wrapper over `BaseRpcContext`
 * exposing the transport-specific bits — here just the matched pattern.
 */
export class InMemoryContext extends BaseRpcContext<InMemoryContextArgs> {
  constructor(args: InMemoryContextArgs) {
    super(args);
  }

  getPattern(): string {
    return this.args[0];
  }
}
