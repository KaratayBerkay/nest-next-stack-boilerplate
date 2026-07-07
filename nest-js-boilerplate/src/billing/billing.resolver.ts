import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CsrfGuard } from '../csrf/csrf.guard';
import { BillingService } from './billing.service';

@ObjectType()
export class SubscribeResult {
  @Field()
  success!: boolean;

  @Field(() => String, { nullable: true })
  reason?: string;

  @Field(() => Date, { nullable: true })
  periodEnd?: Date;
}

@ObjectType()
export class BillingTransaction {
  @Field()
  id!: string;

  @Field()
  type!: string;

  @Field()
  status!: string;

  @Field()
  amount!: number;

  @Field()
  currency!: string;

  @Field()
  reference!: string;

  @Field({ nullable: true })
  stripeInvoiceUrl?: string;

  @Field({ nullable: true })
  metadata?: string;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class SubscriptionInfo {
  @Field(() => SubscriptionTier)
  tier!: SubscriptionTier;

  @Field()
  priceCents!: number;

  @Field()
  currency!: string;

  @Field(() => Date, { nullable: true })
  periodStart?: Date;

  @Field(() => Date, { nullable: true })
  periodEnd?: Date;

  @Field()
  cancelAtPeriodEnd!: boolean;
}

@ObjectType()
export class SetupIntentResult {
  @Field()
  clientSecret!: string;
}

@UseGuards(SessionAuthGuard, CsrfGuard)
@Resolver()
export class BillingResolver {
  constructor(private readonly billing: BillingService) {}

  @Mutation(() => SubscribeResult)
  async subscribeToPlan(
    @CurrentUser() user: JwtUser,
    @Args('tier', { type: () => SubscriptionTier }) tier: SubscriptionTier,
    @Args('paymentMethodId', { nullable: true }) paymentMethodId?: string,
  ): Promise<SubscribeResult> {
    const result = await this.billing.subscribeToPlan(
      user.userId,
      tier,
      paymentMethodId,
    );
    return {
      success: result.success,
      reason: result.reason,
      periodEnd: result.periodEnd,
    };
  }

  @Query(() => [BillingTransaction])
  async myBillingHistory(
    @CurrentUser() user: JwtUser,
  ): Promise<BillingTransaction[]> {
    const txns = await this.billing.getBillingHistory(user.userId);
    return txns.map((t) => ({
      id: t.id,
      type: t.type,
      status: t.status,
      amount: Number(t.amount),
      currency: t.currency,
      reference: t.reference ?? '',
      stripeInvoiceUrl: t.stripeInvoiceUrl ?? undefined,
      metadata: t.metadata ? JSON.stringify(t.metadata) : undefined,
      createdAt: t.createdAt,
    }));
  }

  @Query(() => SubscriptionInfo, { nullable: true })
  async mySubscription(
    @CurrentUser() user: JwtUser,
  ): Promise<SubscriptionInfo | null> {
    const sub = await this.billing.getSubscription(user.userId);
    if (!sub) return null;
    return {
      ...sub,
      periodStart: sub.periodStart ?? undefined,
      periodEnd: sub.periodEnd ?? undefined,
    };
  }

  @Mutation(() => SetupIntentResult)
  async createBillingSetupIntent(
    @CurrentUser() user: JwtUser,
  ): Promise<SetupIntentResult> {
    const result = await this.billing.createSetupIntent(user.userId);
    return { clientSecret: result.clientSecret! };
  }
}
