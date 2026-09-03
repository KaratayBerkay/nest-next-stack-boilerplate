import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class OAuthLoginInput {
  @Field(() => String)
  @IsString()
  @MaxLength(256)
  state!: string;

  /**
   * One-time secret minted by the provider callback and delivered only on
   * the redirect to the registered redirect URI — proves the caller is the
   * client that actually completed the handshake, not just someone who
   * learned (or chose) the `state` (CROSS-032).
   */
  @Field(() => String)
  @IsString()
  @MaxLength(128)
  claim!: string;

  /**
   * PKCE-style verifier for flows that registered a `code_challenge` when
   * initiating (the mobile app, whose custom-scheme callback any app on the
   * device could intercept). Omitted by the web BFFs.
   */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  codeVerifier?: string;
}
