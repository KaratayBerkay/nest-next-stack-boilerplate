import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import type { AuthWs } from '../realtime/realtime.types';
import { RtcCallService } from './rtc-call.service';
import { rtcErrorLog } from './rtc-logger';

/**
 * Registers the rtc:* frame vocabulary on the shared RealtimeGateway, same
 * pattern as MessagingWsGateway — no new gateway, no Socket.IO. Deliberately
 * thin: all validation and state transitions live in RtcCallService, this
 * class only wires frame types to service calls and the disconnect hook.
 */
@Injectable()
export class RtcCallWsGateway implements OnModuleInit {
  private readonly logger = new Logger(RtcCallWsGateway.name);

  constructor(
    private readonly realtime: RealtimeGateway,
    private readonly calls: RtcCallService,
  ) {}

  onModuleInit() {
    this.realtime.registerHandler('rtc:invite', (ws, data) =>
      this.run('invite', ws as AuthWs, data, () =>
        this.calls.invite(ws as AuthWs, data.calleeId, data.hasVideo),
      ),
    );
    this.realtime.registerHandler('rtc:accept', (ws, data) =>
      this.run('accept', ws as AuthWs, data, () =>
        this.calls.accept(ws as AuthWs, data.callId),
      ),
    );
    this.realtime.registerHandler('rtc:reject', (ws, data) =>
      this.run('reject', ws as AuthWs, data, () =>
        this.calls.reject(ws as AuthWs, data.callId),
      ),
    );
    this.realtime.registerHandler('rtc:cancel', (ws, data) =>
      this.run('cancel', ws as AuthWs, data, () =>
        this.calls.cancel(ws as AuthWs, data.callId),
      ),
    );
    this.realtime.registerHandler('rtc:hangup', (ws, data) =>
      this.run('hangup', ws as AuthWs, data, () =>
        this.calls.hangup(ws as AuthWs, data.callId),
      ),
    );

    this.realtime.registerDisconnectHandler((ws) => {
      void this.calls.handleDisconnect(ws).catch((error) => {
        this.logger.error(
          rtcErrorLog('websocket.disconnect_cleanup_failed', error, {
            userId: ws.userId,
            socketId: ws.socketId,
          }),
        );
      });
    });
  }

  private async run(
    operation: string,
    ws: AuthWs,
    data: Record<string, unknown>,
    action: () => Promise<void>,
  ): Promise<void> {
    try {
      await action();
    } catch (error) {
      this.logger.error(
        rtcErrorLog('websocket.operation_failed', error, {
          operation,
          callId: typeof data.callId === 'string' ? data.callId : undefined,
          userId: ws.userId,
          socketId: ws.socketId,
        }),
      );
    }
  }
}
