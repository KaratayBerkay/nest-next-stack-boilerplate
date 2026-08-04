import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../@generated/user/user.model';

/** Shape attached to the request after the JWT guard validates a bearer token. */
export interface JwtUser {
  userId: string;
  email: string;
  role: string;
  tier: string;
  name?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  locale?: string;
  timezone?: string;
  chatNickname?: string;
  useNickname?: boolean;
  friends?: string[];
  unread?: number;
  orgIds?: string[];
  teamIds?: string[];
  sessionId?: string;
  /** Auth-device UUID — used as the E2EE device identifier. */
  deviceId?: string | null;
}

/** JWT payload we sign on login/register. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

/**
 * Full user snapshot resolved from the Redis compound key (v2).
 * All fields are stored in a single HASH per session.
 */
export interface SessionUser {
  userId: string;
  email: string;
  role: string;
  tier: string;
  deviceId: string | null;
  ip: string | null;
  userAgent: string | null;
  issuedAt: string;
  sessionId: string;
  // v2 fields
  v: string;
  name: string;
  username: string;
  avatarUrl: string;
  locale: string;
  timezone: string;
  /** Chat-room display-name override (empty string when unset). */
  chatNickname: string;
  /** Whether chatNickname is actually used in chat rooms right now. */
  useNickname: boolean;
  /** Owner's own preference — withholds avatarUrl from other users when true. */
  hideAvatar: boolean;
  friends: string[];
  unread: number;
  orgIds: string[];
  teamIds: string[];
}

export type SessionUserInput = Omit<SessionUser, 'issuedAt' | 'v'> & {
  issuedAt?: Date;
};

/**
 * GraphQL shape of the `me` query: the identity snapshot held in the Redis
 * session hash. Deliberately NOT the full `User` model — serving `me` from the
 * snapshot keeps guarded requests off Postgres, so only snapshot fields exist.
 */
@ObjectType()
export class SessionUserPayload {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field()
  role!: string;

  @Field()
  tier!: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ defaultValue: 'en' })
  locale!: string;

  @Field({ defaultValue: 'UTC' })
  timezone!: string;

  /** Chat-room display-name override (empty string when unset). */
  @Field({ nullable: true })
  chatNickname?: string;

  /** Whether chatNickname is actually used in chat rooms right now. */
  @Field({ defaultValue: false })
  useNickname!: boolean;

  @Field({ nullable: true })
  sessionId?: string;

  @Field({ defaultValue: false })
  mfaEnabled!: boolean;

  /** Owner's own preference — withholds avatarUrl from other users when true. */
  @Field({ defaultValue: false })
  hideAvatar!: boolean;
}

@ObjectType()
export class AuthPayload {
  /** Session access token — null when mfaRequired is true (challenge flow). */
  @Field(() => String, { nullable: true })
  accessToken?: string;

  /** Opaque RBAC token delivered as httpOnly cookie; the auth-snapshot handle. */
  @Field(() => String, { nullable: true })
  rbacToken?: string;

  /** Device ID (UUID, from DeviceContext — for audit only). */
  @Field(() => String, { nullable: true })
  deviceId?: string;

  /** >=90-char random device token for the device_token cookie (BFF cookie setting). */
  @Field(() => String, { nullable: true })
  deviceToken?: string;

  /** Date-derived user token for the 4th compound-key segment. */
  @Field(() => String, { nullable: true })
  userToken?: string;

  @Field(() => User)
  user!: User;

  /** When true, the client must call verifyLoginMfa with a TOTP code to complete auth. */
  @Field(() => Boolean, { nullable: true })
  mfaRequired?: boolean;

  /** The method the client should use: 'TOTP' or 'EMAIL'. Only set when mfaRequired is true. */
  @Field(() => String, { nullable: true })
  mfaMethod?: 'TOTP' | 'EMAIL';

  /** Opaque one-time token the client passes back to verifyLoginMfa. Only set when mfaRequired is true. */
  @Field(() => String, { nullable: true })
  mfaToken?: string;

  /** Opaque refresh token (sessionId) delivered as both a body field and an httpOnly cookie. */
  @Field(() => String, { nullable: true })
  refreshToken?: string;

  /**
   * Per-session X25519 server public key (hex) for wire encryption. The
   * client ECDH's this with its IndexedDB device key to encrypt message
   * bodies on the wire; the private half never leaves Redis.
   */
  @Field(() => String, { nullable: true })
  serverPublicKey?: string;
}
