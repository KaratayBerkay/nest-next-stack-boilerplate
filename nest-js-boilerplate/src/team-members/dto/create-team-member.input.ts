import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

// Slim input: the team is a flat, validated scalar id; the member is the JWT user (self-join).
// TeamMember has no schema `/// @Validator` rules, so this spec proves GraphQL + FK depth
// (TeamMember -> Team -> Organization -> User) + the JWT guard rather than generated validators.
@InputType()
export class CreateTeamMemberInput {
  @Field()
  @IsUUID()
  teamId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isLead?: boolean;
}
