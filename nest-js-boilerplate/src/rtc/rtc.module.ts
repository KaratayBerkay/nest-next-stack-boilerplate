import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { RedisModule } from '../redis/redis.module';
import { WireCryptoModule } from '../wire-crypto/wire-crypto.module';
import { NotificationModule } from '../notification/notification.module';
import { FriendsModule } from '../friends/friends.module';
import { LiveKitService } from './livekit.service';
import { RtcResolver } from './rtc.resolver';
import { RtcController } from './rtc.controller';
import { RtcWebhookController } from './rtc-webhook.controller';
import { RtcCallService } from './rtc-call.service';
import { RtcCallWsGateway } from './rtc-call-ws.gateway';
import { RtcMeetingService } from './rtc-meeting.service';
import { RtcMeetingSweepService } from './rtc-meeting-sweep.service';
import { RtcStreamService } from './rtc-stream.service';
import { RtcChatService } from './rtc-chat.service';
import { RtcChatWsGateway } from './rtc-chat-ws.gateway';
import { RtcReportService } from './rtc-report.service';
import { RtcRecordingService } from './rtc-recording.service';
import { RtcErrorInterceptor } from './rtc-error.interceptor';

@Module({
  imports: [
    AuthModule,
    AuthorizationModule,
    RealtimeModule,
    RedisModule,
    WireCryptoModule,
    NotificationModule,
    FriendsModule,
  ],
  controllers: [RtcWebhookController, RtcController],
  providers: [
    LiveKitService,
    RtcResolver,
    RtcCallService,
    RtcCallWsGateway,
    RtcMeetingService,
    RtcMeetingSweepService,
    RtcStreamService,
    RtcChatService,
    RtcChatWsGateway,
    RtcReportService,
    RtcRecordingService,
    RtcErrorInterceptor,
  ],
  exports: [
    LiveKitService,
    RtcCallService,
    RtcMeetingService,
    RtcStreamService,
  ],
})
export class RtcModule {}
