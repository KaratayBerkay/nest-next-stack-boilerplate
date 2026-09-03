import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { MfaResolver } from './mfa.resolver';
import { MfaService } from './mfa.service';

@Module({
  imports: [AuthModule, NotificationModule], // AuthModule provides JwtAuthGuard + JwtModule; NotificationModule for SECURITY notifications
  providers: [MfaService, MfaResolver],
  exports: [MfaService],
})
export class MfaModule {}
