import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MfaResolver } from './mfa.resolver';
import { MfaService } from './mfa.service';

@Module({
  imports: [AuthModule], // provides JwtAuthGuard + JwtModule for token verification
  providers: [MfaService, MfaResolver],
})
export class MfaModule {}
