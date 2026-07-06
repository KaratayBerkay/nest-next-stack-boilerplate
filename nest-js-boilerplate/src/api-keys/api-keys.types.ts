import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ApiKeyType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  keyPrefix: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  lastUsedAt?: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  enabled: boolean;

  @Field()
  role: string;

  @Field()
  tier: string;
}

@ObjectType()
export class ApiKeyCreateResult {
  @Field()
  fullKey: string;

  @Field(() => ApiKeyType)
  key: ApiKeyType;
}
