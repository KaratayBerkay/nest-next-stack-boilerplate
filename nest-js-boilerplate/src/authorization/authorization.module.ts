import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { AdminResolver } from './admin.resolver';
import { AuditLogResolver } from './audit-log.resolver';
import { RolesGuard } from './roles.guard';
import { TierGuard } from './tier.guard';

/**
 * RBAC (role-based access control) from the Authorization docs: a `@Roles()` decorator plus a
 * `RolesGuard` that reads the required roles via the `Reflector` and matches the JWT user's role.
 * Additionally, tier-based access via `@MinTier()` + `TierGuard`.
 * `AuthModule` is imported because demo resolvers chain `@UseGuards(JwtAuthGuard, RolesGuard)`.
 */
@Module({
  imports: [AuthModule, RealtimeModule],
  providers: [RolesGuard, TierGuard, AdminResolver, AuditLogResolver],
  exports: [RolesGuard, TierGuard],
})
export class AuthorizationModule {}
