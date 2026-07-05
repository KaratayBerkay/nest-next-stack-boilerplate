import { BadRequestException, UseGuards } from '@nestjs/common';
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
import { BillingService, type CardInfo } from './billing.service';

@ObjectType()
export class SubscribeResult {
  @Field()
  success!: boolean;

  @Field(() => String, { nullable: true })
  reason?: string;
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
  metadata?: string;

  @Field()
  createdAt!: Date;
}

@UseGuards(SessionAuthGuard, CsrfGuard)
@Resolver()
export class BillingResolver {
  constructor(private readonly billing: BillingService) {}

  @Mutation(() => SubscribeResult)
  async subscribeToPlan(
    @CurrentUser() user: JwtUser,
    @Args('tier', { type: () => SubscriptionTier }) tier: SubscriptionTier,
    @Args('last4', { nullable: true }) last4?: string,
    @Args('expMonth', { nullable: true }) expMonth?: number,
    @Args('expYear', { nullable: true }) expYear?: number,
  ): Promise<SubscribeResult> {
    let card: CardInfo | undefined;

    if (last4 || expMonth || expYear) {
      if (!last4 || !/^\d{4}$/.test(last4)) {
        throw new BadRequestException('last4 must be exactly 4 digits');
      }
      if (expMonth === undefined || expMonth < 1 || expMonth > 12) {
        throw new BadRequestException('expMonth must be 1-12');
      }
      if (expYear === undefined || expYear < new Date().getFullYear()) {
        throw new BadRequestException('expYear must not be in the past');
      }
      card = { last4, expMonth, expYear };
    }

    return this.billing.subscribeToPlan(user.userId, tier, card);
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
      metadata: t.metadata ? JSON.stringify(t.metadata) : undefined,
      createdAt: t.createdAt,
    }));
  }
}
