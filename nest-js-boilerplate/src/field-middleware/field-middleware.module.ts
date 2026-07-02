import { Module } from '@nestjs/common';
import { SecretProfileResolver } from './secret-profile.resolver';

// GraphQL field middleware (per-field via @Field({ middleware: [...] })).
@Module({
  providers: [SecretProfileResolver],
})
export class FieldMiddlewareModule {}
