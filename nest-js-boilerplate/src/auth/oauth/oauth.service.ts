import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { oauthProviders, type OAuthProfileResult } from './oauth-providers';

interface PendingState {
  provider: string;
  redirectUri: string;
  expiresAt: number;
  codeVerifier?: string;
}

interface PendingProfile {
  profile: OAuthProfileResult;
  expiresAt: number;
}

/**
 * In-memory store for OAuth state and profile lookups.
 * Cleaned up on retrieval; expired entries are purged lazily.
 */
@Injectable()
export class OAuthService {
  private readonly pendingStates = new Map<string, PendingState>();
  private readonly pendingProfiles = new Map<string, PendingProfile>();
  private readonly ttlMs = 10 * 60 * 1000; // 10 minutes

  constructor(private readonly config: ConfigService) {}

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

  buildAuthUrl(
    providerName: string,
    state: string,
    appRedirectUri: string,
  ): string {
    const { provider, clientId } = this.getProviderOrThrow(providerName);
    const nestCallbackUrl = `${this.config.get<string>('APP_URL', 'http://localhost:3000')}/auth/oauth/${providerName}/callback`;

    let codeVerifier: string | undefined;
    if (provider.pkce) {
      codeVerifier = this.generateCodeVerifier();
    }

    this.pendingStates.set(state, {
      provider: providerName,
      redirectUri: appRedirectUri,
      expiresAt: Date.now() + this.ttlMs,
      codeVerifier,
    });

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
    const pending = this.pendingStates.get(state);
    if (!pending || pending.expiresAt < Date.now()) {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }

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
    this.pendingProfiles.set(state, {
      profile,
      expiresAt: Date.now() + this.ttlMs,
    });

    this.pendingStates.delete(state);
    return pending.redirectUri;
  }

  getRedirectUri(state: string): string | null {
    const pending = this.pendingStates.get(state);
    if (!pending || pending.expiresAt < Date.now()) return null;
    return pending.redirectUri;
  }

  retrieveProfile(state: string): OAuthProfileResult {
    const pending = this.pendingProfiles.get(state);
    if (!pending || pending.expiresAt < Date.now()) {
      throw new UnauthorizedException('OAuth profile expired or not found');
    }
    this.pendingProfiles.delete(state);
    return pending.profile;
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
