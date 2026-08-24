import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { RedisModule } from '../redis/redis.module';
import { WireCryptoModule } from '../wire-crypto/wire-crypto.module';
import { LiveKitService } from './livekit.service';
import { RtcResolver } from './rtc.resolver';
import { RtcController } from './rtc.controller';
import { RtcWebhookController } from './rtc-webhook.controller';
import { RtcCallService } from './rtc-call.service';
import { RtcCallWsGateway } from './rtc-call-ws.gateway';
import { RtcMeetingService } from './rtc-meeting.service';
import { RtcMeetingWsGateway } from './rtc-meeting-ws.gateway';
import { RtcMeetingSweepService } from './rtc-meeting-sweep.service';

@Module({
  imports: [
    AuthModule,
    AuthorizationModule,
    RealtimeModule,
    RedisModule,
    WireCryptoModule,
  ],
  controllers: [RtcWebhookController, RtcController],
  providers: [
    LiveKitService,
    RtcResolver,
    RtcCallService,
    RtcCallWsGateway,
    RtcMeetingService,
    RtcMeetingWsGateway,
    RtcMeetingSweepService,
  ],
  exports: [LiveKitService, RtcCallService, RtcMeetingService],
})
export class RtcModule {}
