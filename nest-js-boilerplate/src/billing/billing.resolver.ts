import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
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

@ObjectType()
export class PaymentMethodInfo {
  @Field()
  id!: string;

  @Field()
  brand!: string;

  @Field()
  last4!: string;

  @Field()
  expMonth!: number;

  @Field()
  expYear!: number;

  @Field()
  isDefault!: boolean;
}

@ObjectType()
export class BillingAddressInfo {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  street?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  zipCode?: string;

  @Field({ nullable: true })
  vatNumber?: string;
}

@InputType()
export class BillingAddressInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  street?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  zipCode?: string;

  @Field({ nullable: true })
  vatNumber?: string;
}

@UseGuards(SessionAuthGuard)
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

  @Query(() => [PaymentMethodInfo])
  async myPaymentMethods(
    @CurrentUser() user: JwtUser,
  ): Promise<PaymentMethodInfo[]> {
    return this.billing.getPaymentMethods(user.userId);
  }

  @Mutation(() => Boolean)
  async removePaymentMethod(
    @CurrentUser() user: JwtUser,
    @Args('paymentMethodId') paymentMethodId: string,
  ): Promise<boolean> {
    await this.billing.removePaymentMethod(user.userId, paymentMethodId);
    return true;
  }

  @Mutation(() => Boolean)
  async setDefaultPaymentMethod(
    @CurrentUser() user: JwtUser,
    @Args('paymentMethodId') paymentMethodId: string,
  ): Promise<boolean> {
    await this.billing.setDefaultPaymentMethod(user.userId, paymentMethodId);
    return true;
  }

  @Query(() => BillingAddressInfo, { nullable: true })
  async myBillingAddress(
    @CurrentUser() user: JwtUser,
  ): Promise<BillingAddressInfo | null> {
    const addr = await this.billing.getBillingAddress(user.userId);
    if (!addr) return null;
    return {
      name: addr.name ?? undefined,
      street: addr.street ?? undefined,
      city: addr.city ?? undefined,
      state: addr.state ?? undefined,
      country: addr.country ?? undefined,
      zipCode: addr.zipCode ?? undefined,
      vatNumber: addr.vatNumber ?? undefined,
    };
  }

  @Mutation(() => BillingAddressInfo)
  async upsertBillingAddress(
    @CurrentUser() user: JwtUser,
    @Args('input') input: BillingAddressInput,
  ): Promise<BillingAddressInfo> {
    const addr = await this.billing.upsertBillingAddress(user.userId, input);
    return {
      name: addr.name ?? undefined,
      street: addr.street ?? undefined,
      city: addr.city ?? undefined,
      state: addr.state ?? undefined,
      country: addr.country ?? undefined,
      zipCode: addr.zipCode ?? undefined,
      vatNumber: addr.vatNumber ?? undefined,
    };
  }
}
