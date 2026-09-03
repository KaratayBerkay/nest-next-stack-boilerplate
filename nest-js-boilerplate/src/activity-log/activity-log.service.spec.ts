import type { Request } from 'express';
import { ActivityLogService } from './activity-log.service';
import type { FrontendEventDto } from './dto/log-activity.dto';

function event(overrides: Partial<FrontendEventDto> = {}): FrontendEventDto {
  return {
    eventType: 'click',
    clientSessionId: 'cs-1',
    timestamp: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('ActivityLogService', () => {
  let service: ActivityLogService;
  let logged: Array<Record<string, unknown>>;

  beforeEach(() => {
    service = new ActivityLogService();
    logged = [];
    jest
      .spyOn(
        (service as unknown as { logger: { log: (o: unknown) => void } })
          .logger,
        'log',
      )
      .mockImplementation((o: unknown) => {
        logged.push(o as Record<string, unknown>);
      });
  });

  it('SECURITY: does NOT trust a client-supplied userId on an unauthenticated request — logging event.userId as `userId` would let anyone forge activity attributed to any account (the endpoint runs behind OptionalAuthGuard, so req.user is absent for anonymous callers)', () => {
    const req = { ip: '10.0.0.1', user: undefined } as unknown as Request;

    service.logEvents([event({ userId: 'victim-account-id' })], req);

    expect(logged).toHaveLength(1);
    expect(logged[0].userId).toBeNull();
  });

  it('uses the guard-resolved userId when the request IS authenticated (client value never overrides it)', () => {
    const req = {
      ip: '10.0.0.1',
      user: { userId: 'real-authed-id', sessionId: 'sess-1' },
    } as unknown as Request;

    service.logEvents([event({ userId: 'attacker-supplied' })], req);

    expect(logged[0].userId).toBe('real-authed-id');
  });
});
