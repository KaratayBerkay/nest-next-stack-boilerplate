import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { RedisModule } from '../redis/redis.module';
import { WireCryptoModule } from '../wire-crypto/wire-crypto.module';
import { LiveKitService } from './livekit.service';
import { RtcResolver } from './rtc.resolver';
import { RtcWebhookController } from './rtc-webhook.controller';

@Module({
  imports: [
    AuthModule,
    AuthorizationModule,
    RealtimeModule,
    RedisModule,
    WireCryptoModule,
  ],
  controllers: [RtcWebhookController],
  providers: [LiveKitService, RtcResolver],
  exports: [LiveKitService],
})
export class RtcModule {}
