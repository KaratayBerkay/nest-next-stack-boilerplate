import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PushSubscription } from '../@generated/push-subscription/push-subscription.model';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { PushSubscriptionService } from './push-subscription.service';

@UseGuards(SessionAuthGuard)
@Resolver(() => PushSubscription)
export class PushSubscriptionResolver {
  constructor(private readonly pushSubscriptions: PushSubscriptionService) {}

  @Mutation(() => PushSubscription)
  subscribePush(
    @CurrentUser() user: JwtUser,
    @Args('endpoint') endpoint: string,
    @Args('p256dh') p256dh: string,
    @Args('auth') auth: string,
    @Args('userAgent', { nullable: true }) userAgent?: string,
  ) {
    return this.pushSubscriptions.subscribe(
      user.userId,
      endpoint,
      p256dh,
      auth,
      userAgent,
    );
  }

  @Mutation(() => Boolean)
  async unsubscribePush(
    @CurrentUser() user: JwtUser,
    @Args('endpoint') endpoint: string,
  ) {
    await this.pushSubscriptions.unsubscribe(user.userId, endpoint);
    return true;
  }
}
