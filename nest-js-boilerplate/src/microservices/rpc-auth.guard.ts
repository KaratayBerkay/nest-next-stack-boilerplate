import { Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Microservices › Guards (#84). A `CanActivate` guard — identical to an HTTP guard, only the
 * context differs: `context.switchToRpc().getData()` reads the incoming message payload (TCP
 * has no separate header channel, so the auth token rides in the message). Returning `false`
 * makes the framework throw `RpcException('Forbidden resource')`, surfaced as
 * `{ status: 'error', message: 'Forbidden resource' }` on the client.
 */
@Injectable()
export class RpcAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const data = context.switchToRpc().getData<{ token?: string }>();
    return data?.token === 'valid-token';
  }
}
