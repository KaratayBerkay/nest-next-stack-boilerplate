import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, SessionUser } from './auth.types';
import { decryptId } from '../common/id-codec/id-codec';
import { TokenDerivationService } from './token-derivation.service';
import { TokenStoreService } from './token-store.service';

export interface SessionTokens {
  accessToken: string | null;
  rbacToken: string | null;
  deviceToken: string | null;
  userToken: string | null;
}

export type SessionValidationFailureReason =
  | 'missing_access_token'
  | 'invalid_jwt'
  | 'missing_rbac_token'
  | 'missing_user_token'
  | 'user_token_expired'
  | 'redis_unavailable'
  | 'session_miss'
  | 'user_mismatch'
  | 'rbac_mismatch';

export type SessionValidationResult =
  | { ok: true; session: SessionUser; compoundKey: string }
  | { ok: false; reason: SessionValidationFailureReason };

/**
 * Shared core of session validation — extracted so the HTTP/GraphQL guard and
 * the WS handshake check can't independently drift the way they implicitly
 * had (the WS side kept its own hand-copied version of this logic). Pure:
 * never throws a transport-specific exception, callers map the discriminated
 * result onto whatever's idiomatic for their own transport.
 */
@Injectable()
export class SessionValidatorService {
  constructor(
    private readonly jwt: JwtService,
    private readonly tokenStore: TokenStoreService,
    private readonly derivation: TokenDerivationService,
  ) {}

  async validate(tokens: SessionTokens): Promise<SessionValidationResult> {
    if (!tokens.accessToken) {
      return { ok: false, reason: 'missing_access_token' };
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(tokens.accessToken);
      // sub is encrypted (see AuthTokenService.issueTokens) — decrypt here,
      // before it's used for anything, so every check below (including the
      // userToken re-derivation a few lines down, which happens before any
      // Redis read) works against the real id like it always has. A
      // malformed/tampered sub is indistinguishable from a bad signature.
      payload = { ...payload, sub: decryptId(payload.sub) };
    } catch {
      return { ok: false, reason: 'invalid_jwt' };
    }

    if (!tokens.rbacToken) {
      return { ok: false, reason: 'missing_rbac_token' };
    }
    if (!tokens.userToken) {
      return { ok: false, reason: 'missing_user_token' };
    }

    const expectedUserToken = this.derivation.deriveUserToken(payload.sub);
    if (!this.derivation.timingSafeEqual(tokens.userToken, expectedUserToken)) {
      return { ok: false, reason: 'user_token_expired' };
    }

    const compoundKey = this.tokenStore.buildKey(
      tokens.accessToken,
      tokens.rbacToken,
      tokens.deviceToken ?? '',
      tokens.userToken,
    );
    let session: SessionUser | null;
    try {
      session = await this.tokenStore.read(compoundKey);
    } catch {
      return { ok: false, reason: 'redis_unavailable' };
    }
    if (!session) {
      return { ok: false, reason: 'session_miss' };
    }

    if (payload.sub !== session.userId) {
      return { ok: false, reason: 'user_mismatch' };
    }

    const expectedRbacToken = this.derivation.deriveRbacToken(
      session.userId,
      session.tier,
    );
    if (!this.derivation.timingSafeEqual(tokens.rbacToken, expectedRbacToken)) {
      return { ok: false, reason: 'rbac_mismatch' };
    }

    return { ok: true, session, compoundKey };
  }
}
