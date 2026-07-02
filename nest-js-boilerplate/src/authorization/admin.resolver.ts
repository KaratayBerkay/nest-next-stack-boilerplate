import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '../@generated/prisma/user-role.enum';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

/**
 * Demonstrates the RBAC pipeline: `JwtAuthGuard` authenticates and attaches the user, then
 * `RolesGuard` enforces `@Roles()`. `whoAmI` carries no `@Roles()` (any authenticated user is
 * allowed — the "no required roles" path), while `adminStats` is restricted to elevated roles.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Resolver()
export class AdminResolver {
  @Query(() => String, { name: 'whoAmI' })
  whoAmI(@CurrentUser() user: JwtUser): string {
    return `${user.email}:${user.role}`;
  }

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Query(() => String, { name: 'adminStats' })
  adminStats(): string {
    return 'top-secret-admin-stats';
  }
}
