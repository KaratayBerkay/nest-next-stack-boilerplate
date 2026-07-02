import { ForbiddenException } from '@nestjs/common';
import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';
import { UserRole } from '../@generated/prisma/user-role.enum';

// The caller's role for this request. A real app derives it from the authenticated user; here it
// comes from an `x-role` header so the proof test can flip between an allowed and a denied caller.
function callerRole(ctx: MiddlewareContext): UserRole {
  const context = ctx.context as {
    req?: { headers?: Record<string, string | string[] | undefined> };
  };
  const header = context.req?.headers?.['x-role'];
  const value = Array.isArray(header) ? header[0] : header;
  return value === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER;
}

// Field middleware that enforces the `@Extensions({ role })` metadata attached to a field. The
// metadata is read back at resolve time from the field's own GraphQL config — the documented use
// case for extensions (docs.nestjs.com/graphql/extensions).
export const checkRoleMiddleware: FieldMiddleware = (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const { info } = ctx;
  const extensions = (info.parentType.getFields()[info.fieldName].extensions ??
    {}) as { role?: UserRole };
  const requiredRole = extensions.role;

  // Fields with no role metadata are unrestricted.
  if (requiredRole === undefined) return next();

  // The docs snippet uses `if (userRole === extensions.role) throw`, which blocks exactly the
  // role that should be allowed (inverted). Correct check: block when the caller LACKS the role.
  if (callerRole(ctx) !== requiredRole) {
    throw new ForbiddenException(
      `User does not have sufficient permissions to access "${info.fieldName}" field.`,
    );
  }
  return next();
};
