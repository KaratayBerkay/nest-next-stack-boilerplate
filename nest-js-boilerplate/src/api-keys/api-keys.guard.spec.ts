import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { ApiKeyGuard } from './api-keys.guard';
import type { ApiKeysService } from './api-keys.service';

function mockApiKeysService(overrides: { validate?: jest.Mock } = {}) {
  return {
    validate: overrides.validate ?? jest.fn(),
  } as unknown as ApiKeysService;
}

interface MockRequest {
  headers: Record<string, string | undefined>;
  user: Record<string, unknown> | undefined;
  _authenticatedByApiKey?: boolean;
}

function createRequest(authHeader?: string): MockRequest {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
    user: undefined,
  };
}

function gqlCtx(
  req: MockRequest,
): Pick<
  ExecutionContext,
  'getType' | 'getHandler' | 'getClass' | 'getArgs' | 'getArgByIndex'
> {
  const args: [null, Record<string, never>, { req: MockRequest }, null] = [
    null,
    {},
    { req },
    null,
  ];
  return {
    getType: () => 'graphql' as const,
    getHandler: () => ({}),
    getClass: () => Object,
    getArgs: () => args,
    getArgByIndex: (i: number) => args[i],
  };
}

describe('ApiKeyGuard', () => {
  it('skips when no Authorization header is present', async () => {
    const service = mockApiKeysService();
    const guard = new ApiKeyGuard(service);
    const req = createRequest();

    const result = await guard.canActivate(
      gqlCtx(req) as unknown as ExecutionContext,
    );

    expect(result).toBe(true);
    expect(req.user).toBeUndefined();
    expect(req._authenticatedByApiKey).toBeUndefined();
  });

  it('skips when Authorization header is not a Bearer bp_ token', async () => {
    const service = mockApiKeysService();
    const guard = new ApiKeyGuard(service);
    const req = createRequest('Bearer some-jwt-token');

    const result = await guard.canActivate(
      gqlCtx(req) as unknown as ExecutionContext,
    );

    expect(result).toBe(true);
    expect(service.validate).not.toHaveBeenCalled();
  });

  it('validates a bp_ API key and sets req.user + _authenticatedByApiKey', async () => {
    const validate = jest.fn().mockResolvedValue({
      userId: 'u1',
      role: 'ADMIN',
      tier: 'PREMIUM',
    });
    const service = mockApiKeysService({ validate });
    const guard = new ApiKeyGuard(service);
    const req = createRequest('Bearer bp_abc123def456');

    const result = await guard.canActivate(
      gqlCtx(req) as unknown as ExecutionContext,
    );

    expect(result).toBe(true);
    expect(validate).toHaveBeenCalledWith('bp_abc123def456');
    expect(req.user).toEqual({
      userId: 'u1',
      role: 'ADMIN',
      tier: 'PREMIUM',
    });
    expect(req._authenticatedByApiKey).toBe(true);
  });

  it('throws 401 when API key validation fails', async () => {
    const validate = jest.fn().mockResolvedValue(null);
    const service = mockApiKeysService({ validate });
    const guard = new ApiKeyGuard(service);
    const req = createRequest('Bearer bp_invalid-key');

    await expect(
      guard.canActivate(gqlCtx(req) as unknown as ExecutionContext),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws 401 when API key validation throws', async () => {
    const validate = jest.fn().mockRejectedValue(
      new Error('DB connection lost'),
    );
    const service = mockApiKeysService({ validate });
    const guard = new ApiKeyGuard(service);
    const req = createRequest('Bearer bp_abc123');

    await expect(
      guard.canActivate(gqlCtx(req) as unknown as ExecutionContext),
    ).rejects.toThrow('DB connection lost');
  });

  it('does not set _authenticatedByApiKey when skipping non-bp_ tokens', async () => {
    const service = mockApiKeysService();
    const guard = new ApiKeyGuard(service);
    const req = createRequest('Bearer eyJhbGciOi...');

    await guard.canActivate(gqlCtx(req) as unknown as ExecutionContext);

    expect(req._authenticatedByApiKey).toBeUndefined();
    expect(req.user).toBeUndefined();
  });
});
