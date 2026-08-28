import { firstValueFrom, of } from 'rxjs';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { IdCodecInterceptor } from './id-codec.interceptor';
import { decryptId, _resetKeysForTests } from './id-codec';

function httpContext(request: unknown, response: unknown): ExecutionContext {
  return {
    getType: () => 'http',
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
    const interceptor = new IdCodecInterceptor();
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

    const interceptor = new IdCodecInterceptor();
    const result = await firstValueFrom(
      interceptor.intercept(
        httpContext(request, response),
        handlerReturning(response),
      ),
    );

    expect(result).toBe(response);
  });

  it('leaves non-http contexts (GraphQL field resolution) completely alone', async () => {
    const interceptor = new IdCodecInterceptor();
    const context = {
      getType: () => 'graphql',
    } as unknown as ExecutionContext;
    const payload = { id: UUID_A };

    const result = await firstValueFrom(
      interceptor.intercept(context, handlerReturning(payload)),
    );

    expect(result).toBe(payload);
  });
});
