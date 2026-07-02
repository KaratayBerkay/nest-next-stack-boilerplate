import { Query, Resolver } from '@nestjs/graphql';
import { SecuredAccount } from './models/secured-account.model';

@Resolver(() => SecuredAccount)
export class AccountsResolver {
  // Returns the raw values; the @Extensions role metadata is enforced per field by the middleware.
  @Query(() => SecuredAccount, { name: 'account' })
  account(): SecuredAccount {
    return { username: 'ada', apiToken: 'tok_live_secret' };
  }
}
