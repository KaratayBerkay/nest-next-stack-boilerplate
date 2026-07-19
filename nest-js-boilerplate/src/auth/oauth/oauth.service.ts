import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { oauthProviders, type OAuthProfileResult } from './oauth-providers';

const OAUTH_STATE_PREFIX = 'oauth:state:';
const OAUTH_PROFILE_PREFIX = 'oauth:profile:';
const OAUTH_TTL_SEC = 600; // 10 minutes

type PendingState = {
  provider: string;
  redirectUri: string;
  codeVerifier?: string;
};

/**
 * Redis-backed store for OAuth state and profile lookups.
 * Survives multi-replica deployments.
 */
@Injectable()
export class OAuthService {
  constructor(
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  private get providerNames(): string {
    return Object.values(oauthProviders)
      .filter((p) => this.config.get<string>(p.clientIdEnv))
      .map((p) => p.name)
      .join(',');
  }

  getConfiguredProviders(): string[] {
    return Object.values(oauthProviders)
      .filter((p) => this.config.get<string>(p.clientIdEnv))
      .map((p) => p.name);
  }

  getProviderOrThrow(name: string) {
    const provider = oauthProviders[name];
    if (!provider) throw new UnauthorizedException(`Unknown provider: ${name}`);
    const clientId = this.config.get<string>(provider.clientIdEnv);
    if (!clientId)
      throw new UnauthorizedException(
        `${provider.label} OAuth is not configured`,
      );
    return { provider, clientId };
  }

  private generateCodeVerifier(): string {
    return randomBytes(32)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private generateCodeChallenge(verifier: string): string {
    return createHash('sha256')
      .update(verifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async buildAuthUrl(
    providerName: string,
    state: string,
    appRedirectUri: string,
  ): Promise<string> {
    const { provider, clientId } = this.getProviderOrThrow(providerName);
    const nestCallbackUrl = `${this.config.get<string>('APP_URL', 'http://localhost:3000')}/auth/oauth/${providerName}/callback`;

    let codeVerifier: string | undefined;
    if (provider.pkce) {
      codeVerifier = this.generateCodeVerifier();
    }

    await this.redis.setex(
      `${OAUTH_STATE_PREFIX}${state}`,
      OAUTH_TTL_SEC,
      JSON.stringify({
        provider: providerName,
        redirectUri: appRedirectUri,
        codeVerifier,
      }),
    );

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: nestCallbackUrl,
      response_type: 'code',
      scope: provider.scopes.join(' '),
      state,
    });

    if (codeVerifier) {
      params.set('code_challenge', this.generateCodeChallenge(codeVerifier));
      params.set('code_challenge_method', 'S256');
    }

    return `${provider.authUrl}?${params.toString()}`;
  }

  async handleCallback(code: string, state: string): Promise<string> {
    const raw = await this.redis.get(`${OAUTH_STATE_PREFIX}${state}`);
    if (!raw) {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }
    const pending = JSON.parse(raw) as PendingState;

    const { provider, clientId } = this.getProviderOrThrow(pending.provider);
    const clientSecret = this.config.get<string>(provider.clientSecretEnv);
    const nestCallbackUrl = `${this.config.get<string>('APP_URL', 'http://localhost:3000')}/auth/oauth/${pending.provider}/callback`;

    // Exchange code for access token
    const tokenBody = new URLSearchParams({
      code,
      redirect_uri: nestCallbackUrl,
      grant_type: 'authorization_code',
    });

    const tokenHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...provider.additionalHeaders,
    };

    if (provider.useBasicAuth) {
      const basic = Buffer.from(`${clientId}:${clientSecret}`).toString(
        'base64',
      );
      tokenHeaders['Authorization'] = `Basic ${basic}`;
    } else {
      tokenBody.set('client_id', clientId);
      tokenBody.set('client_secret', clientSecret as string);
    }

    if (pending.codeVerifier) {
      tokenBody.set('code_verifier', pending.codeVerifier);
    }

    // fallow-ignore-next-line security-sink — provider.tokenUrl is hardcoded config
    const tokenRes = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: tokenHeaders,
      body: tokenBody,
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      throw new UnauthorizedException(
        `Token exchange failed: ${tokenRes.status} ${text}`,
      );
    }

    const tokenJson = (await tokenRes.json()) as Record<string, string>;
    const accessToken = tokenJson.access_token;

    // Fetch user profile
    const profile = await this.fetchProfile(
      pending.provider,
      accessToken,
      clientId,
    );

    // Store profile for pickup by Next.js BFF
    await this.redis.setex(
      `${OAUTH_PROFILE_PREFIX}${state}`,
      OAUTH_TTL_SEC,
      JSON.stringify(profile),
    );

    await this.redis.del(`${OAUTH_STATE_PREFIX}${state}`);
    return pending.redirectUri;
  }

  async getRedirectUri(state: string): Promise<string | null> {
    const raw = await this.redis.get(`${OAUTH_STATE_PREFIX}${state}`);
    if (!raw) return null;
    const pending = JSON.parse(raw) as PendingState;
    return pending.redirectUri;
  }

  async retrieveProfile(state: string): Promise<OAuthProfileResult> {
    const raw = await this.redis.get(`${OAUTH_PROFILE_PREFIX}${state}`);
    if (!raw) {
      throw new UnauthorizedException('OAuth profile expired or not found');
    }
    const profile = JSON.parse(raw) as OAuthProfileResult;
    await this.redis.del(`${OAUTH_PROFILE_PREFIX}${state}`);
    return profile;
  }

  private async fetchProfile(
    providerName: string,
    accessToken: string,
    clientId: string,
  ): Promise<OAuthProfileResult> {
    const provider = oauthProviders[providerName];
    if (!provider)
      throw new UnauthorizedException(`Unknown provider: ${providerName}`);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    };

    // Twitch requires Client-Id header
    if (providerName === 'twitch') {
      headers['Client-Id'] = clientId;
    }

    // fallow-ignore-next-line security-sink — provider.userinfoUrl is hardcoded config
    const res = await fetch(provider.userinfoUrl, { headers });
    if (!res.ok) {
      throw new UnauthorizedException(`Profile fetch failed: ${res.status}`);
    }

    const raw = (await res.json()) as Record<string, unknown>;
    let email = String((raw.email as string | null | undefined) ?? '');

    // GitHub may not return email in /user — fetch separately
    if (!email && provider.fetchEmail) {
      email = (await provider.fetchEmail(accessToken, clientId)) ?? '';
    }

    const result = await provider.transformProfile(raw, accessToken, clientId);
    if (!result.email && email) result.email = email;
    if (!result.email) {
      result.email = `${providerName}_${result.providerAccountId}@placeholder.eys.gen.tr`;
    }

    return result;
  }
}
