import { Extensions, Field, ObjectType } from '@nestjs/graphql';
import { UserRole } from '../../@generated/prisma/user-role.enum';
import { checkRoleMiddleware } from '../check-role.middleware';

// Named SecuredAccount (not Account) to avoid colliding with the Prisma-generated `Account` type
// in the app-wide schema.
@ObjectType()
export class SecuredAccount {
  // Public field: no @Extensions metadata, so the middleware lets it through for any caller.
  @Field()
  username: string;

  // `@Extensions` attaches arbitrary low-level metadata to this field's schema config; the
  // checkRoleMiddleware reads that metadata back at resolve time and gates access on it.
  @Field({ middleware: [checkRoleMiddleware] })
  @Extensions({ role: UserRole.ADMIN })
  apiToken: string;
}
