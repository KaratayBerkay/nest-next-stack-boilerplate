import { Field, InputType, PickType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TaskPriority } from '../../@generated/prisma/task-priority.enum';
import { TaskCreateInput } from '../../@generated/task/task-create.input';

// Slim, purpose-built GraphQL input (cf. RegisterInput). `title` is inherited from the
// schema-GENERATED TaskCreateInput via PickType, so its auto-generated @MinLength(1)/
// @MaxLength(200) validators carry over and stay under test. The FK references are exposed as
// flat, validated scalar ids — unlike the generated nested-relation inputs, which carry no
// class-validator decorator and are therefore stripped by ValidationPipe({ whitelist: true }).
// The creator FK is taken from the JWT, not the client.
@InputType()
export class CreateTaskInput extends PickType(TaskCreateInput, [
  'title',
] as const) {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => TaskPriority, { nullable: true })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: `${TaskPriority}`;

  @Field()
  @IsUUID()
  projectId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;
}
