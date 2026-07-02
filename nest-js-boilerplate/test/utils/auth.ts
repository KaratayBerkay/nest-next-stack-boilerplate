import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

export interface GqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

/** POST a GraphQL operation at the in-process app; attaches a bearer token when given. */
export const gql = async <T>(
  app: INestApplication<App>,
  query: string,
  token?: string,
): Promise<GqlResponse<T>> => {
  const req = request(app.getHttpServer()).post('/graphql').send({ query });
  if (token) req.set('Authorization', `Bearer ${token}`);
  const res = await req.expect(200);
  return res.body as GqlResponse<T>;
};

export interface AuthedUser {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
}

/**
 * Registers a fresh user and returns its tokens. Each call uses a unique email so specs sharing
 * the same database don't collide. Shared by the domain-resolver e2e specs so each one doesn't
 * re-implement the auth handshake — they log in here, then drive their own resolver with the token.
 */
export const registerAndLogin = async (
  app: INestApplication<App>,
  overrides: { email?: string; password?: string; name?: string } = {},
): Promise<AuthedUser> => {
  const email =
    overrides.email ??
    `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;
  const password = overrides.password ?? 'sup3rSecret!';
  const name = overrides.name ?? 'Test User';

  const body = await gql<{
    register: {
      accessToken: string;
      refreshToken: string;
      user: { id: string; email: string };
    };
  }>(
    app,
    `mutation { register(input: { email: "${email}", password: "${password}", name: "${name}" }) {
      accessToken refreshToken user { id email } } }`,
  );

  if (!body.data) {
    throw new Error(`registerAndLogin failed: ${JSON.stringify(body.errors)}`);
  }
  const { accessToken, refreshToken, user } = body.data.register;
  return { accessToken, refreshToken, userId: user.id, email: user.email };
};
