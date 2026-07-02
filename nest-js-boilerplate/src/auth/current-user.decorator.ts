import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';
import { JwtUser } from './auth.types';

/** Resolver param decorator returning the JWT user attached by {@link JwtAuthGuard}. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtUser => {
    const req = GqlExecutionContext.create(context).getContext<{
      req: Request & { user: JwtUser };
    }>().req;
    return req.user;
  },
);
