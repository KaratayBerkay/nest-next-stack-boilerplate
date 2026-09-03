import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { oauthProviders, type OAuthProfileResult } from './oauth-providers';

const OAUTH_STATE_PREFIX = 'oauth:state:';
// Exported so tests can seed a verified profile directly (simulating a
// completed provider handshake) instead of driving a real OAuth consent
// screen, which e2e tests have no credentials to do.
export const OAUTH_PROFILE_PREFIX = 'oauth:profile:';
export const OAUTH_TTL_SEC = 600; // 10 minutes

// RFC 7636 §4.2: base64url(SHA-256(verifier)) is always exactly 43 chars.
const CODE_CHALLENGE_RE = /^[A-Za-z0-9_-]{43}$/;

type PendingState = {
  provider: string;
  redirectUri: string;
  /** Provider-side PKCE verifier (X etc.), unrelated to the client one below. */
  codeVerifier?: string;
  /**
   * S256 challenge the *initiating client* registered (CROSS-032). Required
   * whenever `redirectUri` is an app scheme: custom schemes aren't exclusive
   * on Android/iOS, so any app can receive the callback intent — the client
   * that started the flow must also prove it holds the matching verifier
   * before `retrieveProfile` hands the session over.
   */
  clientCodeChallenge?: string;
};

/**
 * What `handleCallback` stores under {@link OAUTH_PROFILE_PREFIX}: the
 * provider profile plus the secrets `retrieveProfile` checks before it will
 * release it. Exported so e2e tests seed the same shape a real callback does.
 */
export type StoredOAuthProfile = OAuthProfileResult & {
  /** sha256 hex of the one-time `claim` minted at callback time. */
  claimHash: string;
  clientCodeChallenge?: string;
};

function base64Url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** RFC 7636 S256: base64url(SHA-256(ascii(verifier))). */
export function s256CodeChallenge(verifier: string): string {
  return base64Url(createHash('sha256').update(verifier).digest());
}

// Constant-time compare that leaks neither content nor length: both sides are
// hashed to a fixed 32 bytes first, then compared with timingSafeEqual.
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(
    createHash('sha256').update(a).digest(),
    createHash('sha256').update(b).digest(),
  );
}

export function isHttpRedirectUri(uri: string): boolean {
  try {
    const { protocol } = new URL(uri);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

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
    return base64Url(randomBytes(32));
  }

  private generateCodeChallenge(verifier: string): string {
    return s256CodeChallenge(verifier);
  }

  /**
   * @param clientCodeChallenge S256 challenge from the initiating client
   *   (`?code_challenge=` on the initiate URL). Optional for http(s) redirect
   *   URIs (the browser enforces who receives those), mandatory for app-scheme
   *   ones — see {@link PendingState.clientCodeChallenge}.
   */
  async buildAuthUrl(
    providerName: string,
    state: string,
    appRedirectUri: string,
    clientCodeChallenge?: string,
  ): Promise<string> {
    if (
      clientCodeChallenge !== undefined &&
      !CODE_CHALLENGE_RE.test(clientCodeChallenge)
    ) {
      throw new BadRequestException({
        exc: 'EX_VALIDATION_FORM',
        msg: 'Malformed code_challenge (expected a 43-char base64url S256 digest)',
        key: 'error.invalidCodeChallenge',
      });
    }
    if (!clientCodeChallenge && !isHttpRedirectUri(appRedirectUri)) {
      throw new BadRequestException({
        exc: 'EX_VALIDATION_FORM',
        msg: 'code_challenge is required for app-scheme redirect URIs',
        key: 'error.missingCodeChallenge',
      });
    }

    const { provider, clientId } = this.getProviderOrThrow(providerName);
    const nestCallbackUrl = `${this.config.get<string>('APP_URL', 'http://localhost:3000')}/auth/oauth/${providerName}/callback`;

    let codeVerifier: string | undefined;
    if (provider.pkce) {
      codeVerifier = this.generateCodeVerifier();
    }

    const pending: PendingState = {
      provider: providerName,
      redirectUri: appRedirectUri,
      codeVerifier,
      clientCodeChallenge,
    };
    await this.redis.setex(
      `${OAUTH_STATE_PREFIX}${state}`,
      OAUTH_TTL_SEC,
      JSON.stringify(pending),
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

  /**
   * Exchanges the provider code, stores the verified profile for pickup, and
   * returns where to send the browser plus the one-time `claim` that must
   * accompany `state` on that redirect (CROSS-032).
   *
   * Why a claim: `state` alone is chosen by whoever *initiates* the flow, so
   * an attacker could start one, phish the victim into completing the
   * provider consent, and then redeem the victim's profile with the state
   * they already knew. The claim is minted here, at completion time, and
   * travels only inside the redirect to the registered redirect URI — so
   * only the browser that finished the handshake (and the app/BFF it lands
   * on) ever sees it.
   */
  async handleCallback(
    code: string,
    state: string,
  ): Promise<{ redirectUri: string; claim: string }> {
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

    // Store profile for pickup by the BFF / mobile app, guarded by the claim
    // (and the client challenge, when one was registered at initiate).
    const claim = base64Url(randomBytes(32));
    const stored: StoredOAuthProfile = {
      ...profile,
      claimHash: sha256Hex(claim),
      ...(pending.clientCodeChallenge
        ? { clientCodeChallenge: pending.clientCodeChallenge }
        : {}),
    };
    await this.redis.setex(
      `${OAUTH_PROFILE_PREFIX}${state}`,
      OAUTH_TTL_SEC,
      JSON.stringify(stored),
    );

    await this.redis.del(`${OAUTH_STATE_PREFIX}${state}`);
    return { redirectUri: pending.redirectUri, claim };
  }

  async getRedirectUri(state: string): Promise<string | null> {
    const raw = await this.redis.get(`${OAUTH_STATE_PREFIX}${state}`);
    if (!raw) return null;
    const pending = JSON.parse(raw) as PendingState;
    return pending.redirectUri;
  }

  /**
   * Redeems a completed handshake. Besides `state`, the caller must present
   * the `claim` delivered on the callback redirect, and — when the initiating
   * client registered a `code_challenge` — the matching PKCE-style
   * `codeVerifier` (CROSS-032). Any mismatch consumes the profile: the
   * secrets are 256-bit random, so a retry can't be a legitimate caller
   * that simply typo'd, only an interceptor guessing.
   */
  async retrieveProfile(
    state: string,
    claim: string,
    codeVerifier?: string,
  ): Promise<OAuthProfileResult> {
    // GETDEL, not GET+DEL — this key is meant to be consumed exactly once.
    // Two concurrent pickups for the same state (a retried BFF request, a
    // double-loaded callback page) previously could both GET the profile
    // before either DEL'd it, so both would proceed to log in/create a user
    // from the same completed OAuth handshake instead of the second one
    // correctly seeing it as already consumed.
    const raw = await this.redis.getdel(`${OAUTH_PROFILE_PREFIX}${state}`);
    if (!raw) {
      throw new UnauthorizedException('OAuth profile expired or not found');
    }
    const { claimHash, clientCodeChallenge, ...profile } = JSON.parse(
      raw,
    ) as StoredOAuthProfile;
    // A record without a claimHash predates CROSS-032 (or was seeded
    // without one) — never redeemable, there is nothing to bind it to.
    if (!claimHash || !claim || !safeEqual(sha256Hex(claim), claimHash)) {
      throw new UnauthorizedException('OAuth claim rejected');
    }
    if (
      clientCodeChallenge &&
      (!codeVerifier ||
        !safeEqual(
          this.generateCodeChallenge(codeVerifier),
          clientCodeChallenge,
        ))
    ) {
      throw new UnauthorizedException('OAuth code verifier rejected');
    }
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
