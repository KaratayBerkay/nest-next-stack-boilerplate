import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';
import { UserRole } from '../@generated/prisma/user-role.enum';
import type { JwtUser } from '../auth/auth.types';
import { ROLES_KEY } from './roles.decorator';

/**
 * RBAC guard from the Authorization docs, adapted for this hybrid GraphQL app.
 *
 * Two deviations from the documented snippet (logged in the docs issues log):
 *  - the docs read the request via `context.switchToHttp().getRequest()`, but our authenticated
 *    user is attached to the GraphQL request context by `JwtAuthGuard`, so we resolve it through
 *    `GqlExecutionContext` (with the documented HTTP path kept as a fallback for REST handlers);
 *  - the docs match `user.roles?.includes(role)` (an array), whereas our `JwtUser` carries a
 *    single `role` (the Prisma `UserRole`), so we compare against that.
 *
 * Run it AFTER the auth guard, e.g. `@UseGuards(JwtAuthGuard, RolesGuard)`.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    // No @Roles() on the handler or class -> open to any authenticated user.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = this.getRequest(context);
    // JwtUser.role is the JWT's `string`; compare against the required UserRole values as
    // strings (mirrors the docs' `user.roles?.includes(role)`, single-role variant).
    return !!user && (requiredRoles as readonly string[]).includes(user.role);
  }

  /** Resolve the request from the GraphQL context, falling back to HTTP for REST handlers. */
  private getRequest(context: ExecutionContext): { user?: JwtUser } {
    if (context.getType<GqlContextType>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext<{
        req: { user?: JwtUser };
      }>().req;
    }
    return context.switchToHttp().getRequest<Request & { user?: JwtUser }>();
  }
}
