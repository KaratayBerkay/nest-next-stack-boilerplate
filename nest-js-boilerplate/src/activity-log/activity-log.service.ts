import { Injectable, Logger } from '@nestjs/common';
import type { Request } from 'express';
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
    const user = (req as Request & { user?: { userId?: string; sessionId?: string } }).user;

    for (const event of events) {
      this.logger.log({
        category: event.category,
        event: event.event ?? event.eventType,
        eventType: event.eventType,
        clientSessionId: event.clientSessionId,
        timestamp: event.timestamp,
        userId: user?.userId ?? event.userId ?? null,
        token: user?.sessionId ?? null,
        ip,
        deviceType: resolveDeviceType(event.platform),
        url: event.url ?? null,
        userAgent: event.userAgent ?? null,
        page: event.page ?? null,
        durationMs: event.durationMs ?? null,
        exceptionType: event.exceptionType ?? null,
        metadata: event.metadata ?? null,
      });
    }
  }
}
