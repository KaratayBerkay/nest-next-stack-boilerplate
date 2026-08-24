import { Injectable, OnModuleInit } from '@nestjs/common';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import type { AuthWs } from '../realtime/realtime.types';
import { RtcMeetingService } from './rtc-meeting.service';

/**
 * Registers the meeting-chat rtc:* frame vocabulary on the shared
 * RealtimeGateway — same pattern as MessagingWsGateway's join-room/
 * room-message handlers, namespaced under `rtc-meeting:` so it never
 * collides with a chat-room Room.slug in RealtimeGateway's shared
 * roomSockets keyspace. Host controls (mute/remove) and the meeting
 * lifecycle itself (create/join/leave/end) are GraphQL mutations
 * (RtcResolver) — this gateway only owns the chat channel.
 */
@Injectable()
export class RtcMeetingWsGateway implements OnModuleInit {
  constructor(
    private readonly realtime: RealtimeGateway,
    private readonly meetings: RtcMeetingService,
  ) {}

  onModuleInit() {
    this.realtime.registerHandler('rtc:join-room-chat', (ws, data) =>
      this.meetings.joinRoomChat(ws as AuthWs, data.slug),
    );
    this.realtime.registerHandler('rtc:leave-room-chat', (ws, data) =>
      this.meetings.leaveRoomChat(ws as AuthWs, data.slug),
    );
    this.realtime.registerHandler('rtc:chat-message', (ws, data) =>
      this.meetings.sendChatMessage(ws as AuthWs, data.slug, data.text),
    );
  }
}
