import { firstValueFrom, of } from 'rxjs';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IdCodecInterceptor } from './id-codec.interceptor';
import { decryptId, _resetKeysForTests } from './id-codec';
import { SkipIdCodec } from './skip-id-codec.decorator';

function httpContext(
  request: unknown,
  response: unknown,
  handler: (...args: unknown[]) => unknown = () => undefined,
  klass: new (...args: unknown[]) => unknown = class {},
): ExecutionContext {
  return {
    getType: () => 'http',
    getHandler: () => handler,
    getClass: () => klass,
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;
}

function handlerReturning(data: unknown): CallHandler {
  return { handle: () => of(data) };
}

describe('IdCodecInterceptor', () => {
  const UUID_A = '01890a5d-ac96-774b-bcce-b302099a8057';

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-interceptor-specs';
    _resetKeysForTests();
  });

  it('encrypts a normal REST payload on the way out', async () => {
    const interceptor = new IdCodecInterceptor(new Reflector());
    const result = (await firstValueFrom(
      interceptor.intercept(
        httpContext({ body: {}, params: {} }, {}),
        handlerReturning({ id: UUID_A }),
      ),
    )) as { id: string };

    expect(result.id).not.toBe(UUID_A);
    expect(decryptId(result.id)).toBe(UUID_A);
  });

  // Regression: RtcWebhookController (and StripeWebhookController — same
  // @Res() shape) returns `res.status(200).json(...)`, i.e. the Express
  // Response object itself. The response-side map used to deepEncryptIds
  // that object; its req<->res cycle made walk() recurse until RangeError,
  // so EVERY LiveKit webhook logged a phantom "Maximum call stack size
  // exceeded" 500 plus an ERR_HTTP_HEADERS_SENT double-reply — after the
  // real 200 had already been flushed to LiveKit.
  it('passes a @Res()-returned Express Response through untouched instead of walking its cyclic object graph', async () => {
    const response: Record<string, unknown> = { statusCode: 200 };
    const request: Record<string, unknown> = {
      body: {},
      params: {},
      res: response,
    };
    response.req = request;

    const interceptor = new IdCodecInterceptor(new Reflector());
    const result = await firstValueFrom(
      interceptor.intercept(
        httpContext(request, response),
        handlerReturning(response),
      ),
    );

    expect(result).toBe(response);
  });

  it('leaves non-http contexts (GraphQL field resolution) completely alone', async () => {
    const interceptor = new IdCodecInterceptor(new Reflector());
    const context = {
      getType: () => 'graphql',
    } as unknown as ExecutionContext;
    const payload = { id: UUID_A };

    const result = await firstValueFrom(
      interceptor.intercept(context, handlerReturning(payload)),
    );

    expect(result).toBe(payload);
  });

  // Regression: every real Stripe webhook delivery since 2026-08-29 400'd
  // with "Invalid id" — Stripe's payload has its own top-level `id` field
  // (evt_...), which matches the global uuid-field name set, so the
  // interceptor's eager deepDecryptIds(request.body) threw on it before
  // StripeWebhookController's own signature check ever ran. @SkipIdCodec()
  // on the controller must make the interceptor a no-op for that route.
  it('skips request decryption and response encryption entirely for a @SkipIdCodec() route', async () => {
    class FakeStripeController {
      @SkipIdCodec()
      handleWebhook() {
        return undefined;
      }
    }

    const externalBody = { id: 'evt_1H_not_our_uuid_format' };
    const request: Record<string, unknown> = { body: externalBody, params: {} };

    const interceptor = new IdCodecInterceptor(new Reflector());
    const result = await firstValueFrom(
      interceptor.intercept(
        httpContext(
          request,
          {},
          // Reflect metadata is keyed by object identity, so this must stay
          // the exact unbound reference @SkipIdCodec() decorated — same as
          // real Nest, whose ExecutionContext.getHandler() also returns the
          // bare method reference, never a bound copy.
          // eslint-disable-next-line @typescript-eslint/unbound-method
          FakeStripeController.prototype.handleWebhook,
          FakeStripeController,
        ),
        handlerReturning({ received: true, id: 'evt_1H_not_our_uuid_format' }),
      ),
    );

    // Body must reach the controller completely untouched — decrypting it
    // would throw BadRequestException before the controller ever runs.
    expect(request.body).toBe(externalBody);
    // Response must not be re-walked/encrypted either — Stripe's own event
    // id in the echoed response must survive as-is.
    expect(result).toEqual({
      received: true,
      id: 'evt_1H_not_our_uuid_format',
    });
  });
});
