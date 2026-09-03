import { Injectable, Logger } from '@nestjs/common';
import type { Request } from 'express';
import { hashSessionId } from '../common/crypto/crypto.service';
import type { FrontendEventDto } from './dto/log-activity.dto';

function resolveDeviceType(platform: string | undefined): string {
  if (!platform) return 'mobile';
  switch (platform) {
    case 'ios':
    case 'android':
      return 'mobile';
    case 'ipados':
      return 'tablet';
    default:
      return 'mobile';
  }
}

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  logEvents(events: FrontendEventDto[], req: Request): void {
    const ip = req.ip ?? null;
    const user = (
      req as Request & { user?: { userId?: string; sessionId?: string } }
    ).user;

    for (const event of events) {
      this.logger.log({
        // NOTE: do not name this "source" — Docker's fluentd log driver already
        // injects a top-level `source` field (stdout/stderr) into every record,
        // which silently wins over this one, per-record, before it ever reaches
        // Fluent Bit's rewrite_tag rule. Confirmed by a live routing test where
        // every activity-log event ended up in backend-logs with source:"stdout".
        origin: 'mobile',
        category: event.category,
        event: event.event ?? event.eventType,
        eventType: event.eventType,
        clientSessionId: event.clientSessionId,
        timestamp: event.timestamp,
        // Only the id the OptionalAuthGuard resolved from a valid session is
        // trusted. This endpoint is unauthenticated, so a client-supplied
        // `event.userId` is attacker-controllable — logging it as `userId`
        // would let anyone forge activity-log entries attributing actions to
        // any account. Anonymous events correlate via `clientSessionId`
        // instead.
        userId: user?.userId ?? null,
        sessionIdHash: user?.sessionId ? hashSessionId(user.sessionId) : null,
        ip,
        deviceType: resolveDeviceType(event.platform),
        url: event.url ?? null,
        userAgent: event.userAgent ?? null,
        page: event.page ?? null,
        durationMs: event.durationMs ?? null,
        exceptionType: event.exceptionType ?? null,
        rtcKind: event.rtcKind ?? null,
        rtcId: event.rtcId ?? null,
        roomName: event.roomName ?? null,
        mediaType: event.mediaType ?? null,
        phase: event.phase ?? null,
        errorMessage: event.errorMessage ?? null,
        stack: event.stack ?? null,
        metadata: event.metadata ?? null,
      });
    }
  }
}
