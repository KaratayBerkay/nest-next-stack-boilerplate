import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../@generated/user/user.model';

/** Shape attached to the request after the JWT guard validates a bearer token. */
export interface JwtUser {
  userId: string;
  email: string;
  role: string;
  tier: string;
}

/** JWT payload we sign on login/register. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

/** Full user snapshot resolved from the Redis compound key. */
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

  /** ≥90-char random device token for the device_token cookie (BFF cookie setting). */
  @Field(() => String, { nullable: true })
  deviceToken?: string;

  @Field(() => User)
  user!: User;
}
