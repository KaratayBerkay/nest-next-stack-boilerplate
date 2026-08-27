import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import type { AuthWs } from '../realtime/realtime.types';
import { RtcMeetingService } from './rtc-meeting.service';
import { RtcStreamService } from './rtc-stream.service';
import { rtcErrorLog } from './rtc-logger';

/**
 * Registers the room-chat rtc:* frame vocabulary on the shared
 * RealtimeGateway — same pattern as MessagingWsGateway's join-room/
 * room-message handlers. RealtimeGateway.registerHandler only allows one
 * handler per frame type, and meetings and streams deliberately share the
 * exact same three frame types (rtc:join-room-chat/rtc:leave-room-chat/
 * rtc:chat-message — see the plan doc), so this single gateway tries both
 * services against every frame. Each service's own methods already guard on
 * "does this slug belong to me, and is this user an active participant of
 * it" and silently no-op otherwise (meeting slugs and stream slugs are two
 * separate randomly-generated namespaces, so at most one of the two calls
 * ever actually does anything). Host controls, meeting lifecycle, and go-
 * live/join-as-viewer are all GraphQL mutations (RtcResolver) — this
 * gateway only owns the two rooms' shared chat channel.
 */
@Injectable()
export class RtcChatWsGateway implements OnModuleInit {
  private readonly logger = new Logger(RtcChatWsGateway.name);

  constructor(
    private readonly realtime: RealtimeGateway,
    private readonly meetings: RtcMeetingService,
    private readonly streams: RtcStreamService,
  ) {}

  onModuleInit() {
    this.realtime.registerHandler('rtc:join-room-chat', async (ws, data) => {
      const authWs = ws as AuthWs;
      await this.run('join-room-chat', authWs, data, async () => {
        await this.meetings.joinRoomChat(authWs, data.slug);
        await this.streams.joinRoomChat(authWs, data.slug);
      });
    });
    this.realtime.registerHandler('rtc:leave-room-chat', (ws, data) => {
      const authWs = ws as AuthWs;
      // leaveRoomChat on both services is synchronous (an in-memory socket
      // bookkeeping update, not a DB write) — no `async`/`await` needed here.
      void this.run('leave-room-chat', authWs, data, () => {
        this.meetings.leaveRoomChat(authWs, data.slug);
        this.streams.leaveRoomChat(authWs, data.slug);
      });
    });
    this.realtime.registerHandler('rtc:chat-message', async (ws, data) => {
      const authWs = ws as AuthWs;
      await this.run('chat-message', authWs, data, async () => {
        await this.meetings.sendChatMessage(authWs, data.slug, data.text);
        await this.streams.sendChatMessage(authWs, data.slug, data.text);
      });
    });
  }

  private async run(
    operation: string,
    ws: AuthWs,
    data: Record<string, unknown>,
    action: () => void | Promise<void>,
  ): Promise<void> {
    try {
      await action();
    } catch (error) {
      this.logger.error(
        rtcErrorLog('websocket.chat_operation_failed', error, {
          operation,
          slug: typeof data.slug === 'string' ? data.slug : undefined,
          userId: ws.userId,
          socketId: ws.socketId,
        }),
      );
    }
  }
}
