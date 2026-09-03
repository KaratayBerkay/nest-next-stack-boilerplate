import { BadRequestException, HttpStatus } from '@nestjs/common';
import { OAuthController } from './oauth.controller';

const CONFIG: Record<string, string> = {
  FRONTEND_URL: 'https://app.example.com',
  MOBILE_OAUTH_REDIRECT_ORIGIN: 'flutterboilerplate://oauth',
};

const CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

function build() {
  const oauth = {
    buildAuthUrl: jest.fn(),
    handleCallback: jest.fn(),
    getRedirectUri: jest.fn().mockResolvedValue(null),
  };
  const config = {
    get: jest.fn((key: string, def?: string) => CONFIG[key] ?? def),
  };
  const controller = new OAuthController(
    oauth as never,
    {} as never,
    config as never,
  );
  return { oauth, controller };
}

function mockRes() {
  return { redirect: jest.fn() };
}

describe('OAuthController', () => {
  describe('initiate', () => {
    it('forwards the client code_challenge to buildAuthUrl and 302s to the provider URL', async () => {
      const { oauth, controller } = build();
      oauth.buildAuthUrl.mockResolvedValue('https://provider.example/auth');

      const result = await controller.initiate(
        'google',
        'state-1',
        'flutterboilerplate://oauth/callback',
        CHALLENGE,
      );

      expect(oauth.buildAuthUrl).toHaveBeenCalledWith(
        'google',
        'state-1',
        'flutterboilerplate://oauth/callback',
        CHALLENGE,
      );
      expect(result).toEqual({
        url: 'https://provider.example/auth',
        statusCode: HttpStatus.FOUND,
      });
    });

    it('passes undefined, not an empty string, when no code_challenge query param was sent (web BFF flows)', async () => {
      const { oauth, controller } = build();
      oauth.buildAuthUrl.mockResolvedValue('https://provider.example/auth');

      await controller.initiate(
        'google',
        'state-1',
        'https://app.example.com/api/auth/oauth/google/callback',
        '',
      );

      expect(oauth.buildAuthUrl).toHaveBeenCalledWith(
        'google',
        'state-1',
        'https://app.example.com/api/auth/oauth/google/callback',
        undefined,
      );
    });

    it('rejects a redirect_uri outside the allow-list before the service is ever consulted', async () => {
      const { oauth, controller } = build();

      await expect(
        controller.initiate(
          'google',
          'state-1',
          'https://evil.example/callback',
          CHALLENGE,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(oauth.buildAuthUrl).not.toHaveBeenCalled();
    });
  });

  describe('callback', () => {
    it('redirects to the registered app-scheme target with both the state and the freshly minted claim (CROSS-032)', async () => {
      const { oauth, controller } = build();
      oauth.handleCallback.mockResolvedValue({
        redirectUri: 'flutterboilerplate://oauth/callback',
        claim: 'one-time-claim',
      });
      const res = mockRes();

      await controller.callback(
        'google',
        'code-1',
        'state-1',
        '',
        res as never,
      );

      expect(oauth.handleCallback).toHaveBeenCalledWith('code-1', 'state-1');
      expect(res.redirect).toHaveBeenCalledWith(
        HttpStatus.FOUND,
        'flutterboilerplate://oauth/callback?state=state-1&claim=one-time-claim',
      );
    });

    it('appends to an existing query string on the web BFF callback URL', async () => {
      const { oauth, controller } = build();
      oauth.handleCallback.mockResolvedValue({
        redirectUri:
          'https://app.example.com/api/auth/oauth/google/callback?x=1',
        claim: 'c',
      });
      const res = mockRes();

      await controller.callback(
        'google',
        'code-1',
        'state-1',
        '',
        res as never,
      );

      expect(res.redirect).toHaveBeenCalledWith(
        HttpStatus.FOUND,
        'https://app.example.com/api/auth/oauth/google/callback?x=1&state=state-1&claim=c',
      );
    });

    it('falls back to the frontend origin — never a non-allow-listed target — when the stored redirect URI is not safe', async () => {
      const { oauth, controller } = build();
      oauth.handleCallback.mockResolvedValue({
        redirectUri: 'https://evil.example/cb',
        claim: 'c',
      });
      const res = mockRes();

      await controller.callback(
        'google',
        'code-1',
        'state-1',
        '',
        res as never,
      );

      expect(res.redirect).toHaveBeenCalledWith(
        HttpStatus.FOUND,
        'https://app.example.com?state=state-1&claim=c',
      );
    });

    it('sends provider-reported errors to the login page without exchanging anything', async () => {
      const { oauth, controller } = build();
      const res = mockRes();

      await controller.callback(
        'google',
        '',
        'state-1',
        'access_denied',
        res as never,
      );

      expect(oauth.handleCallback).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        HttpStatus.FOUND,
        'https://app.example.com/auth/login?error=access_denied',
      );
    });
  });
});
