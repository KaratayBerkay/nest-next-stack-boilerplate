import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { TokenStoreService } from './../src/auth/token-store.service';
import { TokenDerivationService } from './../src/auth/token-derivation.service';
import { SubscriptionTier } from './../src/@generated/prisma/subscription-tier.enum';
import type { JwtPayload } from './../src/auth/auth.types';
import { gql } from './utils/auth';

describe('@MinTier guard enforcement (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let tokenStore: TokenStoreService;
  let derivation: TokenDerivationService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    tokenStore = app.get(TokenStoreService);
    derivation = app.get(TokenDerivationService);
    const secret = app.get(ConfigService).getOrThrow<string>('JWT_SECRET');
    jwt = new JwtService({ secret });
  }, 30_000);

  afterAll(async () => {
    await app.close();
  });

  /** Register a user and return tokens + id. */
  const registerUser = async () => {
    const email = `tier_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;
    const password = 'sup3rSecret!';

    const body = await gql<{
      register: {
        accessToken: string;
        rbacToken?: string;
        userToken?: string;
        user: { id: string; email: string };
      };
    }>(
      app,
      `mutation {
        register(input: { email: "${email}", password: "${password}", name: "Tier Test" }) {
          accessToken rbacToken userToken user { id email }
        }
      }`,
    );

    if (!body.data) {
      throw new Error(`registerUser failed: ${JSON.stringify(body.errors)}`);
    }

    return {
      accessToken: body.data.register.accessToken,
      rbacToken: body.data.register.rbacToken ?? '',
      userToken: body.data.register.userToken ?? '',
      userId: body.data.register.user.id,
      email,
      password,
    };
  };

  /**
   * Upgrade a user to a specific tier: update Postgres, rewrite Redis session,
   * and return fresh RBAC token for the new tier.
   */
  const upgradeTier = async (
    userId: string,
    tier: SubscriptionTier,
    email: string,
    password: string,
  ) => {
    // 1. Update Postgres
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: tier },
    });

    // 2. Rewrite Redis session
    await tokenStore.rewriteFieldsForUser(userId, { tier });

    // 3. Re-login to get a fresh RBAC token derived with the new tier
    const body = await gql<{
      login: {
        accessToken: string;
        rbacToken?: string;
        userToken?: string;
      };
    }>(
      app,
      `mutation {
        login(input: { email: "${email}", password: "${password}" }) {
          accessToken rbacToken userToken
        }
      }`,
    );

    if (!body.data) {
      throw new Error(`upgradeTier login failed: ${JSON.stringify(body.errors)}`);
    }

    return {
      accessToken: body.data.login.accessToken,
      rbacToken: body.data.login.rbacToken ?? '',
      userToken: body.data.login.userToken ?? '',
    };
  };

  const authHeaders = (
    accessToken: string,
    rbacToken: string,
    userToken: string,
  ) => ({
    Authorization: `Bearer ${accessToken}`,
    'x-rbac-token': rbacToken,
    'x-user-token': userToken,
  });

  const gqlWithAuth = async <T>(
    query: string,
    accessToken: string,
    rbacToken: string,
    userToken: string,
  ): Promise<{ data?: T; errors?: { message: string }[] }> => {
    const req = require('supertest')(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .set(authHeaders(accessToken, rbacToken, userToken));
    const res = await req.expect(200);
    return res.body as { data?: T; errors?: { message: string }[] };
  };

  // ─── premiumStats: @MinTier(BASIC) ────────────────────────────

  describe('premiumStats (@MinTier(BASIC))', () => {
    it('rejects a FREE user with 403', async () => {
      const user = await registerUser();
      const res = await gqlWithAuth<{ premiumStats?: unknown }>(
        `{ premiumStats { totalUsers activeUsers revenue } }`,
        user.accessToken,
        user.rbacToken,
        user.userToken,
      );
      expect(res.data?.premiumStats).toBeFalsy();
      expect(res.errors?.[0]?.message).toMatch(/forbidden/i);
    });

    it('allows a MEDIUM user (above BASIC)', async () => {
      const user = await registerUser();
      const upgraded = await upgradeTier(
        user.userId,
        SubscriptionTier.MEDIUM,
        user.email,
        user.password,
      );
      const res = await gqlWithAuth<{ premiumStats?: { totalUsers: number } }>(
        `{ premiumStats { totalUsers activeUsers revenue } }`,
        upgraded.accessToken,
        upgraded.rbacToken,
        upgraded.userToken,
      );
      expect(res.errors).toBeUndefined();
      expect(res.data?.premiumStats).toBeDefined();
      expect(typeof res.data?.premiumStats?.totalUsers).toBe('number');
    });

    it('allows a BASIC user (at the minimum)', async () => {
      const user = await registerUser();
      const upgraded = await upgradeTier(
        user.userId,
        SubscriptionTier.BASIC,
        user.email,
        user.password,
      );
      const res = await gqlWithAuth<{ premiumStats?: { totalUsers: number } }>(
        `{ premiumStats { totalUsers activeUsers revenue } }`,
        upgraded.accessToken,
        upgraded.rbacToken,
        upgraded.userToken,
      );
      expect(res.errors).toBeUndefined();
      expect(res.data?.premiumStats).toBeDefined();
    });
  });

  // ─── growthStats: @MinTier(MEDIUM) ────────────────────────────

  describe('growthStats (@MinTier(MEDIUM))', () => {
    it('rejects a FREE user with 403', async () => {
      const user = await registerUser();
      const res = await gqlWithAuth<{ growthStats?: unknown }>(
        `{ growthStats { totalUsers newUsersLast7Days totalPosts totalFriendships } }`,
        user.accessToken,
        user.rbacToken,
        user.userToken,
      );
      expect(res.data?.growthStats).toBeFalsy();
      expect(res.errors?.[0]?.message).toMatch(/forbidden/i);
    });

    it('rejects a BASIC user with 403 (below MEDIUM)', async () => {
      const user = await registerUser();
      const upgraded = await upgradeTier(
        user.userId,
        SubscriptionTier.BASIC,
        user.email,
        user.password,
      );
      const res = await gqlWithAuth<{ growthStats?: unknown }>(
        `{ growthStats { totalUsers newUsersLast7Days totalPosts totalFriendships } }`,
        upgraded.accessToken,
        upgraded.rbacToken,
        upgraded.userToken,
      );
      expect(res.data?.growthStats).toBeFalsy();
      expect(res.errors?.[0]?.message).toMatch(/forbidden/i);
    });

    it('allows a MEDIUM user (at the minimum)', async () => {
      const user = await registerUser();
      const upgraded = await upgradeTier(
        user.userId,
        SubscriptionTier.MEDIUM,
        user.email,
        user.password,
      );
      const res = await gqlWithAuth<{
        growthStats?: { totalUsers: number; newUsersLast7Days: number; totalPosts: number; totalFriendships: number };
      }>(
        `{ growthStats { totalUsers newUsersLast7Days totalPosts totalFriendships } }`,
        upgraded.accessToken,
        upgraded.rbacToken,
        upgraded.userToken,
      );
      expect(res.errors).toBeUndefined();
      expect(res.data?.growthStats).toBeDefined();
      expect(typeof res.data?.growthStats?.totalUsers).toBe('number');
      expect(typeof res.data?.growthStats?.newUsersLast7Days).toBe('number');
      expect(typeof res.data?.growthStats?.totalPosts).toBe('number');
      expect(typeof res.data?.growthStats?.totalFriendships).toBe('number');
    });

    it('allows a PREMIUM user (above MEDIUM)', async () => {
      const user = await registerUser();
      const upgraded = await upgradeTier(
        user.userId,
        SubscriptionTier.PREMIUM,
        user.email,
        user.password,
      );
      const res = await gqlWithAuth<{ growthStats?: { totalUsers: number } }>(
        `{ growthStats { totalUsers newUsersLast7Days totalPosts totalFriendships } }`,
        upgraded.accessToken,
        upgraded.rbacToken,
        upgraded.userToken,
      );
      expect(res.errors).toBeUndefined();
      expect(res.data?.growthStats).toBeDefined();
    });
  });
});
