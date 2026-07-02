import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminResolver } from './admin.resolver';
import { RolesGuard } from './roles.guard';

/**
 * RBAC (role-based access control) from the Authorization docs: a `@Roles()` decorator plus a
 * `RolesGuard` that reads the required roles via the `Reflector` and matches the JWT user's role.
 * `AuthModule` is imported because the demo resolver chains `@UseGuards(JwtAuthGuard, RolesGuard)`.
 */
@Module({
  imports: [AuthModule],
  providers: [RolesGuard, AdminResolver],
  exports: [RolesGuard],
})
export class AuthorizationModule {}
