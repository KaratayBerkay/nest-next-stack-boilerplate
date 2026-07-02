import { Query, Resolver } from '@nestjs/graphql';
import { SecretProfile } from './models/secret-profile.model';

@Resolver()
export class SecretProfileResolver {
  // Returns raw values; the field middleware on each field transforms them on the way out.
  @Query(() => SecretProfile, { name: 'secretProfile' })
  profile(): SecretProfile {
    return {
      apiKey: 'sk_live_ABCDEFGH',
      greeting: 'hello',
      chant: 'hi',
      plain: 'untouched',
    };
  }
}
