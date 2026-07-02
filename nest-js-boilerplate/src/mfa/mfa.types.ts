import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MfaEnrollPayload {
  /** otpauth:// URI to render as a QR code in an authenticator app. */
  @Field()
  otpauthUrl!: string;

  /** Base32 secret for manual entry. Shown once at enrollment. */
  @Field()
  secret!: string;
}

@ObjectType()
export class MfaVerifyPayload {
  @Field()
  enabled!: boolean;

  /** One-time backup codes, returned once. Stored only as hashes. */
  @Field(() => [String])
  backupCodes!: string[];
}
