import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// Bound globally via APP_GUARD. ThrottlerGuard pulls the HTTP req/res from the execution
// context to key the rate-limiter by IP; GraphQL / WebSocket / gRPC contexts expose no HTTP
// request there, so we only throttle real REST traffic and let the other transports through.
@Injectable()
export class HttpThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }
    return super.canActivate(context);
  }
}
