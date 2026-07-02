import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { UserRole } from './../src/@generated/prisma/user-role.enum';
import type { JwtPayload } from './../src/auth/auth.types';
import { gql } from './utils/auth';

// Proves the RBAC pipeline (Authorization docs) end-to-end over GraphQL:
//   * JwtAuthGuard authenticates and attaches the user; RolesGuard then enforces @Roles(),
//   * a query with NO @Roles() is open to any authenticated user (the "no required roles" path),
//   * @Roles(ADMIN, SUPERADMIN) rejects a USER token (ForbiddenException -> GraphQL error),
//   * the same query succeeds for an ADMIN token, matched on the JWT user's single `role`.
// Tokens are minted straight from the configured JwtService so the test isn't coupled to the
// register/login role flow — the guards only read the JWT payload (no DB row is needed).
// Requires Postgres + Redis up (AppModule boots Prisma/BullMQ on init).
describe('Authorization — RBAC RolesGuard (e2e)', () => {
  let app: INestApplication<App>;
  let jwt: JwtService;

  const tokenFor = (role: UserRole): Promise<string> =>
    jwt.signAsync({
      sub: `user-${role}`,
      email: `${role.toLowerCase()}@example.com`,
      role,
    } satisfies JwtPayload);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    // Mint tokens with a JwtService configured from the SAME secret the JwtAuthGuard verifies
    // with (AuthModule's JWT_SECRET). We deliberately do NOT pull JwtService out of the container:
    // PassportAuthModule registers its own JwtModule (a hardcoded demo secret), and a global
    // app.get(JwtService) resolves to that instance — its tokens fail the guard's signature check
    // ("Invalid or expired token"). Building from config keeps this test independent of which
    // JwtModule wins the ambiguous global lookup.
    const secret = app.get(ConfigService).getOrThrow<string>('JWT_SECRET');
    jwt = new JwtService({ secret });
  }, 30_000);

  afterAll(async () => {
    await app.close();
  });

  it('rejects an unauthenticated request (JwtAuthGuard runs first)', async () => {
    const res = await gql(app, `{ whoAmI }`);
    expect(res.errors).toBeDefined();
    expect(res.data).toBeFalsy();
  });

  it('allows any authenticated user on a query with no @Roles()', async () => {
    const token = await tokenFor(UserRole.USER);
    const res = await gql<{ whoAmI: string }>(app, `{ whoAmI }`, token);
    expect(res.errors).toBeUndefined();
    expect(res.data?.whoAmI).toBe('user@example.com:USER');
  });

  it('forbids a USER token from a @Roles(ADMIN, SUPERADMIN) query', async () => {
    const token = await tokenFor(UserRole.USER);
    const res = await gql<{ adminStats: string }>(app, `{ adminStats }`, token);
    expect(res.data?.adminStats).toBeFalsy();
    expect(res.errors?.[0]?.message).toMatch(/forbidden/i);
  });

  it('allows an ADMIN token through the @Roles(ADMIN, SUPERADMIN) query', async () => {
    const token = await tokenFor(UserRole.ADMIN);
    const res = await gql<{ adminStats: string }>(app, `{ adminStats }`, token);
    expect(res.errors).toBeUndefined();
    expect(res.data?.adminStats).toBe('top-secret-admin-stats');
  });

  it('also allows the second permitted role (SUPERADMIN)', async () => {
    const token = await tokenFor(UserRole.SUPERADMIN);
    const res = await gql<{ adminStats: string }>(app, `{ adminStats }`, token);
    expect(res.errors).toBeUndefined();
    expect(res.data?.adminStats).toBe('top-secret-admin-stats');
  });
});
