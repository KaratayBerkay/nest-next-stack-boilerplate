import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CryptoModule } from '../common/crypto/crypto.module';
import { RealtimeGateway } from './realtime.gateway';

@Module({
  imports: [AuthModule, CryptoModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
