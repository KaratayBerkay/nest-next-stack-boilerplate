import { Injectable, OnModuleInit } from '@nestjs/common';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import type { AuthWs } from '../realtime/realtime.types';
import { RtcCallService } from './rtc-call.service';

/**
 * Registers the rtc:* frame vocabulary on the shared RealtimeGateway, same
 * pattern as MessagingWsGateway — no new gateway, no Socket.IO. Deliberately
 * thin: all validation and state transitions live in RtcCallService, this
 * class only wires frame types to service calls and the disconnect hook.
 */
@Injectable()
export class RtcCallWsGateway implements OnModuleInit {
  constructor(
    private readonly realtime: RealtimeGateway,
    private readonly calls: RtcCallService,
  ) {}

  onModuleInit() {
    this.realtime.registerHandler('rtc:invite', (ws, data) =>
      this.calls.invite(ws as AuthWs, data.calleeId, data.hasVideo),
    );
    this.realtime.registerHandler('rtc:accept', (ws, data) =>
      this.calls.accept(ws as AuthWs, data.callId),
    );
    this.realtime.registerHandler('rtc:reject', (ws, data) =>
      this.calls.reject(ws as AuthWs, data.callId),
    );
    this.realtime.registerHandler('rtc:cancel', (ws, data) =>
      this.calls.cancel(ws as AuthWs, data.callId),
    );
    this.realtime.registerHandler('rtc:hangup', (ws, data) =>
      this.calls.hangup(ws as AuthWs, data.callId),
    );

    this.realtime.registerDisconnectHandler((ws) => {
      void this.calls.handleDisconnect(ws);
    });
  }
}
