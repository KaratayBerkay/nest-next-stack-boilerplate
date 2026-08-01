import { StripeWebhookController } from './stripe-webhook.controller';
import type { Request, Response } from 'express';

type MockStripeService = {
  constructWebhookEvent: jest.Mock;
  getSubscription: jest.Mock;
  getTierForPriceId: jest.Mock;
};
type MockWallet = { ensureWallet: jest.Mock };
type MockPrisma = {
  user: {
    findUnique: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  };
  walletTransaction: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  $transaction: jest.Mock;
};
type MockTokenStore = { rewriteFieldsForUser: jest.Mock };
type MockConfig = { get: jest.Mock };
type MockOutbox = { emit: jest.Mock };

const PAID_INVOICE = {
  id: 'inv_paid1',
  customer: 'cus_1',
  subscription: 'sub_1',
  amount_paid: 1999,
  currency: 'usd',
  payment_intent: 'pi_1',
  hosted_invoice_url: 'https://invoice.stripe.com/inv_paid1',
  period_end: 1769817600,
};

function setup() {
  const constructWebhookEvent = jest.fn();
  const getSubscription = jest.fn().mockResolvedValue({
    items: { data: [{ price: { id: 'price_premium' } }] },
  });
  const getTierForPriceId = jest.fn().mockReturnValue('PREMIUM');
  const stripeService = { constructWebhookEvent, getSubscription, getTierForPriceId };

  const ensureWallet = jest
    .fn()
    .mockResolvedValue({ id: 'w1', userId: 'u1', currency: 'USD' });
  const wallet = { ensureWallet };

  const userFindUnique = jest.fn().mockResolvedValue({
    id: 'u1',
    subscriptionTier: 'PREMIUM',
    stripeSubscriptionId: 'sub_1',
    stripeCustomerId: 'cus_1',
  });
  const userUpdate = jest.fn().mockResolvedValue({});
  const userUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
  const wtFindUnique = jest.fn().mockResolvedValue(null);
  const wtCreate = jest.fn().mockResolvedValue({});
  const wtUpdate = jest.fn().mockResolvedValue({});
  const prisma = {
    user: {
      findUnique: userFindUnique,
      update: userUpdate,
      updateMany: userUpdateMany,
    },
    walletTransaction: {
      findUnique: wtFindUnique,
      create: wtCreate,
      update: wtUpdate,
    },
    $transaction: jest.fn((cb: (tx: MockPrisma) => Promise<unknown>) =>
      cb(prisma),
    ),
  };

  const rewriteFieldsForUser = jest.fn().mockResolvedValue(undefined);
  const tokenStore = { rewriteFieldsForUser };

  const get = jest.fn().mockImplementation((key: string) => {
    if (key === 'STRIPE_PRICE_PREMIUM') return 'price_premium';
    return null;
  });
  const config = { get };

  const emit = jest.fn().mockResolvedValue(undefined);
  const outbox = { emit };

  const controller = new StripeWebhookController(
    stripeService as never,
    wallet as never,
    prisma as never,
    tokenStore as never,
    config as never,
    outbox as never,
  );

  const req = {
    rawBody: Buffer.from('{}'),
    headers: { 'stripe-signature': 'test-signature' },
  } as unknown as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response & { status: jest.Mock; json: jest.Mock };

  return {
    controller,
    req,
    res,
    mocks: {
      stripeService,
      wallet,
      prisma,
      tokenStore,
      config,
      outbox,
    },
  };
}

async function dispatch(
  controller: StripeWebhookController,
  req: Request,
  res: Response & { json: jest.Mock },
  mocks: ReturnType<typeof setup>['mocks'],
  type: string,
  object: Record<string, unknown>,
) {
  mocks.stripeService.constructWebhookEvent.mockReturnValue({
    type,
    data: { object },
  });
  await controller.handleWebhook(req, res);
  expect(res.json).toHaveBeenCalledWith({ received: true });
}

describe('StripeWebhookController', () => {
  it('rejects a missing signature', async () => {
    const { controller, req, res } = setup();
    delete (req.headers as Record<string, string>)['stripe-signature'];
    await controller.handleWebhook(req, res);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing stripe-signature header' });
  });

  describe('invoice.paid', () => {
    it('stores amount_paid in cents without double-dividing', async () => {
      const { controller, req, res, mocks } = setup();
      await dispatch(controller, req, res, mocks, 'invoice.paid', PAID_INVOICE);

      expect(mocks.prisma.walletTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 1999,
            currency: 'USD',
            idempotencyKey: 'stripe_invoice:inv_paid1',
          }) as never,
        }) as never,
      );
    });

    it('creates a transaction for a new invoice', async () => {
      const { controller, req, res, mocks } = setup();
      await dispatch(controller, req, res, mocks, 'invoice.paid', PAID_INVOICE);

      expect(mocks.prisma.walletTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stripePaymentIntentId: 'pi_1',
            stripeInvoiceUrl: 'https://invoice.stripe.com/inv_paid1',
            reference: 'subscription:PREMIUM',
          }) as never,
        }) as never,
      );
      expect(mocks.prisma.walletTransaction.update).not.toHaveBeenCalled();
    });

    it('reconciles the existing transaction on invoice re-delivery', async () => {
      const { controller, req, res, mocks } = setup();
      mocks.prisma.walletTransaction.findUnique.mockResolvedValue({
        idempotencyKey: 'stripe_invoice:inv_paid1',
        amount: 0,
        metadata: { tier: 'PREMIUM', provider: 'stripe' },
      });

      await dispatch(controller, req, res, mocks, 'invoice.paid', PAID_INVOICE);

      expect(mocks.prisma.walletTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { idempotencyKey: 'stripe_invoice:inv_paid1' },
          data: expect.objectContaining({ amount: 1999 }) as never,
        }) as never,
      );
      expect(mocks.prisma.walletTransaction.create).not.toHaveBeenCalled();
    });

    it('reconciles the user tier from the billed subscription', async () => {
      const { controller, req, res, mocks } = setup();
      mocks.prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        subscriptionTier: 'BASIC',
        stripeSubscriptionId: 'sub_old',
        stripeCustomerId: 'cus_1',
      });

      await dispatch(controller, req, res, mocks, 'invoice.paid', {
        ...PAID_INVOICE,
        subscription: 'sub_new',
      });

      expect(mocks.prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: expect.objectContaining({
            subscriptionTier: 'PREMIUM',
          }) as never,
        }) as never,
      );
      expect(mocks.tokenStore.rewriteFieldsForUser).toHaveBeenCalledWith(
        'u1',
        { tier: 'PREMIUM' },
      );
    });

    it('does not overwrite the subscription id with a non-subscription invoice', async () => {
      const { controller, req, res, mocks } = setup();
      mocks.stripeService.getSubscription.mockResolvedValue(null);

      await dispatch(controller, req, res, mocks, 'invoice.paid', {
        ...PAID_INVOICE,
        subscription: null,
        period_end: 1769817600,
      });

      const updateCalls = mocks.prisma.user.update.mock.calls;
      const periodUpdate = updateCalls.find(
        (call: unknown[]) =>
          (call[0] as { data?: unknown }).data &&
          Object.keys((call[0] as { data: Record<string, unknown> }).data).some(
            (k) => k === 'subscriptionPeriodEnd',
          ),
      );
      expect(periodUpdate).toBeDefined();
      expect(
        (periodUpdate[0] as { data: Record<string, unknown> }).data
          .stripeSubscriptionId,
      ).toBeUndefined();
    });
  });

  describe('customer.subscription.updated', () => {
    it('reads current_period_end from items.data[0], not the top level', async () => {
      const { controller, req, res, mocks } = setup();
      await dispatch(
        controller,
        req,
        res,
        mocks,
        'customer.subscription.updated',
        {
          customer: 'cus_1',
          cancel_at_period_end: false,
          items: {
            data: [{ current_period_end: 1769817600 }],
          },
        },
      );

      expect(mocks.prisma.user.updateMany).toHaveBeenCalledWith({
        where: { stripeCustomerId: 'cus_1' },
        data: expect.objectContaining({
          subscriptionPeriodEnd: new Date(1769817600 * 1000),
        }) as never,
      });
    });

    it('keeps periodEnd null when items.data is empty or missing', async () => {
      const { controller, req, res, mocks } = setup();
      await dispatch(
        controller,
        req,
        res,
        mocks,
        'customer.subscription.updated',
        {
          customer: 'cus_1',
          cancel_at_period_end: true,
          items: { data: [] },
        },
      );

      expect(mocks.prisma.user.updateMany).toHaveBeenCalledWith({
        where: { stripeCustomerId: 'cus_1' },
        data: expect.objectContaining({
          cancelAtPeriodEnd: true,
          subscriptionPeriodEnd: null,
        }) as never,
      });
    });
  });

  describe('customer.subscription.deleted', () => {
    it('downgrades to FREE when the deleted subscription is the user\'s', async () => {
      const { controller, req, res, mocks } = setup();
      await dispatch(
        controller,
        req,
        res,
        mocks,
        'customer.subscription.deleted',
        { id: 'sub_1', customer: 'cus_1' },
      );

      expect(mocks.prisma.walletTransaction.create).not.toHaveBeenCalled();
      expect(mocks.prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subscriptionTier: 'FREE',
            stripeSubscriptionId: null,
          }) as never,
        }) as never,
      );
    });

    it('skips the FREE downgrade when a replacement subscription is active', async () => {
      const { controller, req, res, mocks } = setup();
      mocks.prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        subscriptionTier: 'PREMIUM',
        stripeSubscriptionId: 'sub_new',
        stripeCustomerId: 'cus_1',
      });

      await dispatch(
        controller,
        req,
        res,
        mocks,
        'customer.subscription.deleted',
        { id: 'sub_old', customer: 'cus_1' },
      );

      expect(mocks.prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
