import { Module } from '@nestjs/common';
import { AccountsResolver } from './accounts.resolver';

// GraphQL extensions: arbitrary field metadata via @Extensions(), consumed by a field middleware
// (checkRoleMiddleware) that reads it back from the field's schema config to enforce access.
@Module({
  providers: [AccountsResolver],
})
export class ExtensionsModule {}
