import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../@generated/user/user.model';

/** Shape attached to the request after the JWT guard validates a bearer token. */
export interface JwtUser {
  userId: string;
  email: string;
  role: string;
}

/** JWT payload we sign on login/register. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken!: string;

  /** Opaque refresh token backed by a Session row. */
  @Field()
  refreshToken!: string;

  /** Device ID (UUID, internal FK for Session rows). */
  @Field(() => String, { nullable: true })
  deviceId?: string;

  /** ≥90-char random device token for the device_token cookie (BFF cookie setting). */
  @Field(() => String, { nullable: true })
  deviceToken?: string;

  @Field(() => User)
  user!: User;
}
