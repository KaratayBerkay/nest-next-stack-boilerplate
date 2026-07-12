import { UnauthorizedException } from '@nestjs/common';
import { OAuthService } from './oauth.service';

interface MockRedis {
  setex: jest.Mock;
  get: jest.Mock;
  del: jest.Mock;
}

function mockRedis(): MockRedis {
  return { setex: jest.fn(), get: jest.fn(), del: jest.fn() };
}

function mockConfig(values: Record<string, string> = {}) {
  return {
    get: jest.fn((key: string, def?: string) => values[key] ?? def),
  };
}

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  };
}

const CONFIGURED = {
  GOOGLE_CLIENT_ID: 'google-client-id',
  GOOGLE_CLIENT_SECRET: 'google-client-secret',
  GITHUB_CLIENT_ID: 'github-client-id',
  GITHUB_CLIENT_SECRET: 'github-client-secret',
  X_CLIENT_ID: 'x-client-id',
  X_CLIENT_SECRET: 'x-client-secret',
  APP_URL: 'https://api.example.com',
};

describe('OAuthService', () => {
  let redis: MockRedis;
  let mockFetch: jest.Mock;
  const originalFetch = global.fetch;

  beforeEach(() => {
    redis = mockRedis();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function buildService(values: Record<string, string> = CONFIGURED) {
    return new OAuthService(mockConfig(values) as never, redis as never);
  }

  describe('getConfiguredProviders', () => {
    it('returns only providers whose client id env var is set', () => {
      const service = buildService({
        GOOGLE_CLIENT_ID: 'google-client-id',
      });

      expect(service.getConfiguredProviders()).toEqual(['google']);
    });

    it('returns an empty array when nothing is configured', () => {
      const service = buildService({});

      expect(service.getConfiguredProviders()).toEqual([]);
    });
  });

  describe('getProviderOrThrow', () => {
    it('throws for an unknown provider name', () => {
      const service = buildService();

      expect(() => service.getProviderOrThrow('not-a-provider')).toThrow(
        UnauthorizedException,
      );
    });

    it('throws when the provider exists but has no client id configured', () => {
      const service = buildService({});

      expect(() => service.getProviderOrThrow('google')).toThrow(
        UnauthorizedException,
      );
    });

    it('returns the provider config and client id when configured', () => {
      const service = buildService();

      const { provider, clientId } = service.getProviderOrThrow('google');

      expect(provider.name).toBe('google');
      expect(clientId).toBe('google-client-id');
    });
  });

  describe('buildAuthUrl', () => {
    it('stores pending state in Redis and returns a well-formed auth URL (non-PKCE provider)', async () => {
      const service = buildService();

      const url = await service.buildAuthUrl(
        'google',
        'state-123',
        'https://app.example.com/callback',
      );

      expect(redis.setex).toHaveBeenCalledWith(
        'oauth:state:state-123',
        600,
        expect.any(String),
      );
      const stored = JSON.parse(
        (redis.setex.mock.calls[0] as unknown[])[2] as string,
      ) as { provider: string; redirectUri: string; codeVerifier?: string };
      expect(stored).toEqual({
        provider: 'google',
        redirectUri: 'https://app.example.com/callback',
        codeVerifier: undefined,
      });

      const parsed = new URL(url);
      expect(parsed.origin + parsed.pathname).toBe(
        'https://accounts.google.com/o/oauth2/v2/auth',
      );
      expect(parsed.searchParams.get('client_id')).toBe('google-client-id');
      expect(parsed.searchParams.get('redirect_uri')).toBe(
        'https://api.example.com/auth/oauth/google/callback',
      );
      expect(parsed.searchParams.get('state')).toBe('state-123');
      expect(parsed.searchParams.has('code_challenge')).toBe(false);
    });

    it('adds a PKCE code_challenge for providers that require it', async () => {
      const service = buildService();

      const url = await service.buildAuthUrl(
        'x',
        'state-pkce',
        'https://app.example.com/callback',
      );

      const parsed = new URL(url);
      expect(parsed.searchParams.get('code_challenge_method')).toBe('S256');
      expect(parsed.searchParams.get('code_challenge')).toBeTruthy();

      const stored = JSON.parse(
        (redis.setex.mock.calls[0] as unknown[])[2] as string,
      ) as { codeVerifier?: string };
      expect(stored.codeVerifier).toBeTruthy();
    });

    it('throws before touching Redis when the provider is not configured', async () => {
      const service = buildService({});

      await expect(
        service.buildAuthUrl('google', 's1', 'https://app.example.com/cb'),
      ).rejects.toThrow(UnauthorizedException);
      expect(redis.setex).not.toHaveBeenCalled();
    });
  });

  describe('handleCallback', () => {
    it('throws when the OAuth state is invalid or expired', async () => {
      redis.get.mockResolvedValue(null);
      const service = buildService();

      await expect(
        service.handleCallback('code-1', 'unknown-state'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('exchanges the code, fetches the profile, stores it, and returns the redirect URI (non-basic-auth provider)', async () => {
      redis.get.mockResolvedValue(
        JSON.stringify({
          provider: 'google',
          redirectUri: 'https://app.example.com/done',
        }),
      );
      mockFetch
        .mockResolvedValueOnce(jsonResponse({ access_token: 'tok-abc' }))
        .mockResolvedValueOnce(
          jsonResponse({
            sub: 'g-123',
            email: 'alice@example.com',
            name: 'Alice',
          }),
        );
      const service = buildService();

      const redirectUri = await service.handleCallback('code-1', 'state-1');

      expect(redirectUri).toBe('https://app.example.com/done');

      // Token exchange used client_id/client_secret in the body, not Basic auth.
      const tokenCall = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(tokenCall[0]).toBe('https://oauth2.googleapis.com/token');
      const tokenBody = tokenCall[1].body as URLSearchParams;
      expect(tokenBody.get('client_id')).toBe('google-client-id');
      expect(tokenBody.get('client_secret')).toBe('google-client-secret');
      expect(tokenBody.get('code')).toBe('code-1');
      const tokenHeaders = tokenCall[1].headers as Record<string, string>;
      expect(tokenHeaders.Authorization).toBeUndefined();

      // Profile stored under the profile key, and the state key removed.
      expect(redis.setex).toHaveBeenCalledWith(
        'oauth:profile:state-1',
        600,
        expect.any(String),
      );
      const storedProfile = JSON.parse(
        (redis.setex.mock.calls[0] as unknown[])[2] as string,
      ) as { email: string; provider: string; providerAccountId: string };
      expect(storedProfile).toEqual({
        type: 'GOOGLE',
        provider: 'google',
        providerAccountId: 'g-123',
        email: 'alice@example.com',
        name: 'Alice',
      });
      expect(redis.del).toHaveBeenCalledWith('oauth:state:state-1');
    });

    it('uses HTTP Basic auth and PKCE code_verifier for providers that require it', async () => {
      redis.get.mockResolvedValue(
        JSON.stringify({
          provider: 'x',
          redirectUri: 'https://app.example.com/done',
          codeVerifier: 'verifier-xyz',
        }),
      );
      mockFetch
        .mockResolvedValueOnce(jsonResponse({ access_token: 'tok-x' }))
        .mockResolvedValueOnce(
          jsonResponse({
            data: { id: 'x-1', name: 'X User', username: 'xuser' },
            email: 'x-user@example.com',
          }),
        );
      const service = buildService();

      await service.handleCallback('code-x', 'state-x');

      const tokenCall = mockFetch.mock.calls[0] as [string, RequestInit];
      const tokenHeaders = tokenCall[1].headers as Record<string, string>;
      expect(tokenHeaders.Authorization).toBe(
        `Basic ${Buffer.from('x-client-id:x-client-secret').toString('base64')}`,
      );
      const tokenBody = tokenCall[1].body as URLSearchParams;
      expect(tokenBody.get('client_secret')).toBeNull(); // sent via header, not body
      expect(tokenBody.get('code_verifier')).toBe('verifier-xyz');
    });

    it('throws and does not fetch a profile when the token exchange fails', async () => {
      redis.get.mockResolvedValue(
        JSON.stringify({
          provider: 'google',
          redirectUri: 'https://app.example.com/done',
        }),
      );
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ error: 'invalid_grant' }, false, 400),
      );
      const service = buildService();

      await expect(
        service.handleCallback('bad-code', 'state-1'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockFetch).toHaveBeenCalledTimes(1); // never reached the profile fetch
      expect(redis.setex).not.toHaveBeenCalled();
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('throws when the provider profile endpoint returns an error', async () => {
      redis.get.mockResolvedValue(
        JSON.stringify({
          provider: 'google',
          redirectUri: 'https://app.example.com/done',
        }),
      );
      mockFetch
        .mockResolvedValueOnce(jsonResponse({ access_token: 'tok-abc' }))
        .mockResolvedValueOnce(jsonResponse({}, false, 401));
      const service = buildService();

      await expect(service.handleCallback('code-1', 'state-1')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(redis.setex).not.toHaveBeenCalled();
    });

    it('falls back to the fetchEmail hook when the userinfo response omits email (GitHub)', async () => {
      redis.get.mockResolvedValue(
        JSON.stringify({
          provider: 'github',
          redirectUri: 'https://app.example.com/done',
        }),
      );
      mockFetch
        .mockResolvedValueOnce(jsonResponse({ access_token: 'tok-gh' }))
        .mockResolvedValueOnce(jsonResponse({ id: 42, name: 'Gita Hub' })) // no email field
        .mockResolvedValueOnce(
          jsonResponse([
            { email: 'secondary@example.com', primary: false, verified: true },
            { email: 'primary@example.com', primary: true, verified: true },
          ]),
        );
      const service = buildService();

      await service.handleCallback('code-gh', 'state-gh');

      const storedProfile = JSON.parse(
        (redis.setex.mock.calls[0] as unknown[])[2] as string,
      ) as { email: string };
      expect(storedProfile.email).toBe('primary@example.com');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('generates a placeholder email when the provider has no email anywhere', async () => {
      redis.get.mockResolvedValue(
        JSON.stringify({
          provider: 'github',
          redirectUri: 'https://app.example.com/done',
        }),
      );
      mockFetch
        .mockResolvedValueOnce(jsonResponse({ access_token: 'tok-gh' }))
        .mockResolvedValueOnce(jsonResponse({ id: 42, name: 'No Email' }))
        .mockResolvedValueOnce(jsonResponse([])); // fetchEmail finds nothing
      const service = buildService();

      await service.handleCallback('code-gh', 'state-gh');

      const storedProfile = JSON.parse(
        (redis.setex.mock.calls[0] as unknown[])[2] as string,
      ) as { email: string; providerAccountId: string };
      expect(storedProfile.email).toBe(
        `github_${storedProfile.providerAccountId}@placeholder.eys.gen.tr`,
      );
    });
  });

  describe('getRedirectUri', () => {
    it('returns the stored redirect URI for a pending state', async () => {
      redis.get.mockResolvedValue(
        JSON.stringify({
          provider: 'google',
          redirectUri: 'https://app.example.com/cb',
        }),
      );
      const service = buildService();

      await expect(service.getRedirectUri('state-1')).resolves.toBe(
        'https://app.example.com/cb',
      );
    });

    it('returns null when the state does not exist', async () => {
      redis.get.mockResolvedValue(null);
      const service = buildService();

      await expect(service.getRedirectUri('missing')).resolves.toBeNull();
    });
  });

  describe('retrieveProfile', () => {
    it('returns and consumes (deletes) the stored profile', async () => {
      const profile = {
        type: 'GOOGLE',
        provider: 'google',
        providerAccountId: 'g-1',
        email: 'alice@example.com',
      };
      redis.get.mockResolvedValue(JSON.stringify(profile));
      const service = buildService();

      const result = await service.retrieveProfile('state-1');

      expect(result).toEqual(profile);
      expect(redis.del).toHaveBeenCalledWith('oauth:profile:state-1');
    });

    it('throws when the profile has expired or was already consumed', async () => {
      redis.get.mockResolvedValue(null);
      const service = buildService();

      await expect(service.retrieveProfile('gone')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(redis.del).not.toHaveBeenCalled();
    });
  });
});
