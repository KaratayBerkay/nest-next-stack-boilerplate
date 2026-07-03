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
  friends?: string[];
  unread?: number;
  orgIds?: string[];
  teamIds?: string[];
  sessionId?: string;
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
}

/**
 * GraphQL shape of the `mySessions` query: a Postgres Session row plus the
 * computed `current` marker (row id == the guard-attached sessionId). Not the
 * generated Session model — `current` only exists on this projection, and the
 * durable token itself must never be exposed.
 */
@ObjectType()
export class SessionInfo {
  @Field()
  id!: string;

  @Field(() => String, { nullable: true })
  ip?: string | null;

  @Field(() => String, { nullable: true })
  userAgent?: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  expiresAt!: Date;

  @Field()
  current!: boolean;
}

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken!: string;

  /** Opaque refresh token backed by a Session row. */
  @Field()
  refreshToken!: string;

  /** Opaque RBAC token delivered as httpOnly cookie; the auth-snapshot handle. */
  @Field(() => String, { nullable: true })
  rbacToken?: string;

  /** Device ID (UUID, internal FK for Session rows). */
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
}
