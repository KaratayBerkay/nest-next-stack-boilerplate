import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';
import type { JwtUser } from './auth.types';

/** Resolver param decorator returning the JWT user attached by {@link JwtAuthGuard} or
 *  {@link SessionAuthGuard}. Works for both GraphQL and HTTP contexts. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtUser => {
    const req =
      context.getType<'graphql'>() === 'graphql'
        ? GqlExecutionContext.create(context).getContext<{
            req: Request & { user: JwtUser };
          }>().req
        : context.switchToHttp().getRequest<Request & { user: JwtUser }>();
    return req.user;
  },
);
