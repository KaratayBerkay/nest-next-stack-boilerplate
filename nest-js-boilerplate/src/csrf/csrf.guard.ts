import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';
import { validateRequest } from './csrf.middleware';

// Double-submit CSRF as a Guard rather than route middleware. GraphQL is a single POST endpoint,
// so middleware on /graphql would block every query + bearer-authed mutation alike. This guard is
// applied only to the cookie-driven mutations (refresh/logout) — the exact CSRF-sensitive surface,
// since those rely on the ambient httpOnly refresh cookie. Bearer-token traffic stays untouched.
// Clients fetch the token via GET /csrf/token (sets the csrf cookie) and echo it in `x-csrf-token`.
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = this.getRequest(context);
    if (!validateRequest(req)) {
      throw new ForbiddenException('Invalid or missing CSRF token');
    }
    return true;
  }

  private getRequest(context: ExecutionContext): Request {
    if (context.getType<'graphql'>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext<{ req: Request }>()
        .req;
    }
    return context.switchToHttp().getRequest<Request>();
  }
}
