import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CryptoModule } from '../common/crypto/crypto.module';
import { WireCryptoModule } from '../wire-crypto/wire-crypto.module';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimePresenceService } from './realtime-presence.service';

@Module({
  imports: [forwardRef(() => AuthModule), CryptoModule, WireCryptoModule],
  providers: [RealtimeGateway, RealtimePresenceService],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
