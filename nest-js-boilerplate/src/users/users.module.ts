import { Module } from '@nestjs/common';
import { AuthContractsModule } from '../auth/auth-contracts.module';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

// AuthContractsModule supplies SessionAuthGuard's own dependencies
// (TokenStoreService, SessionValidatorService). Without the import, Nest
// can't build the guard inside this module's injector — the whole app failed
// to boot with LOAD_DEMO_MODULES/NODE_ENV=development, which is exactly the
// mode `pnpm start:dev` runs in (.env sets NODE_ENV=development). Unnoticed
// because the deployed backend runs the production build, where this demo
// module never loads.
@Module({
  imports: [AuthContractsModule],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
