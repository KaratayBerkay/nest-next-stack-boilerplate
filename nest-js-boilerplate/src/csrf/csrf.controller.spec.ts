import { NotFoundException } from '@nestjs/common';
import type { Request } from 'express';
import { CsrfController } from './csrf.controller';

// BE-009: `POST /csrf/echo` is a self-test target for the CSRF middleware
// with no product caller — it exists for test/csrf.e2e-spec.ts only, so it
// must not be a reachable body-reflecting endpoint in production.
describe('CsrfController.echo', () => {
  const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
  const controller = new CsrfController();
  const req = { body: { hello: 'world' } } as unknown as Request;

  afterEach(() => {
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
  });

  it('echoes the body outside production (the e2e self-test path)', () => {
    process.env.NODE_ENV = 'test';
    expect(controller.echo(req)).toEqual({ received: { hello: 'world' } });
  });

  it('does not exist in production', () => {
    process.env.NODE_ENV = 'production';
    expect(() => controller.echo(req)).toThrow(NotFoundException);
  });
});
