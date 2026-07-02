import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../@generated/prisma/user-role.enum';

/** Metadata key under which {@link Roles} stores the required roles; read by `RolesGuard`. */
export const ROLES_KEY = 'roles';

/**
 * Declares which {@link UserRole}s may invoke a resolver/handler — the docs' `@Roles()`,
 * but typed to the Prisma-generated `UserRole` enum instead of a hand-written `Role` enum.
 * No decorator (or an empty list) means "any authenticated user", per `RolesGuard`.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
