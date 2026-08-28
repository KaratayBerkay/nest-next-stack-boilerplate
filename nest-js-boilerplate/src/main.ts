import {
  BadRequestException,
  ValidationPipe,
  type ValidationError,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { parse as parseQuerystring } from 'node:querystring';
import zlib from 'zlib';
import helmet from 'helmet';
import type { NextFunction, Request, Response } from 'express';
import { Logger } from 'nestjs-pino';
import { AppModule, isDemoEnabled } from './app.module';
import { internalGrpcOptions } from './grpc/grpc.module';
import { requestContextMiddleware } from './logging/request-context';
import { scannerFilterMiddleware } from './common/scanner-filter/scanner-filter.middleware';
import { DeviceIpMiddleware } from './devices/device-ip-middleware';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { IdCodecInterceptor } from './common/id-codec/id-codec.interceptor';
import { bestEffortDecryptIds } from './common/id-codec/id-codec.util';
import { loadVaultSecrets } from './vault/vault-loader';
import {
  initOpenTelemetry,
  shutdownOpenTelemetry,
} from './telemetry/otel-setup';
import type { ExceptionFieldError } from './common/exceptions/exception-response.interface';

// Safety net: Node emits TimeoutNegativeWarning when setTimeout receives a negative delay
// (e.g. from the `cron` package after a clock jump). Clamp to 0 so the callback runs on the
// next tick instead of never — no hot-loop, no suppressed warning.
process.on('warning', (warn) => {
  if (warn.name === 'TimeoutNegativeWarning') {
    const match = String(warn.message).match(/(-?\d+)/);
    if (match && Number(match[1]) < 0) {
      setImmediate(() => {}); // drain the negative-timeout callback on next tick
    }
  }
});

// Initialize OpenTelemetry BEFORE NestFactory.create() so all instrumentations
// (http, graphql, prisma, ioredis, kafkajs) are active from the start.
// Gated behind OTEL_ENABLED (default off) — with no collector deployed, an
// unconditional start just spams failed OTLP exports every export interval.
if (process.env.OTEL_ENABLED === 'true') {
  initOpenTelemetry();
}

// Express 5's req.query is a live getter that re-parses req.url on every
// access (not cached) — mutating a previously-read req.query object is
// silently lost by the time anything downstream reads it again. Replacing
// the query-parser function itself is the only place a query-string id can
// be decrypted so every later req.query access consistently sees it. Same
// underlying parser Express defaults to ('simple' = querystring.parse); this
// only adds the id decryption on top. Best-effort, not strict: a
// malformed/tampered value is left as-is rather than throwing from inside a
// getter that can be invoked from unpredictably many call sites per request
// — it just fails to match anything downstream instead.
function decryptQueryString(str: string): Record<string, unknown> {
  return bestEffortDecryptIds(parseQuerystring(str)) as Record<string, unknown>;
}

function validationExceptionFactory(errors: ValidationError[]) {
  const fields: ExceptionFieldError[] = errors.flatMap((err) => {
    const constraints = Object.values(err.constraints ?? {});
    return constraints.map((msg) => ({
      field: err.property,
      msg,
      key: `error.validation.${err.property}`,
    }));
  });

  return new BadRequestException({
    statusCode: 400,
    exc: 'EX_VALIDATION_FORM' as const,
    msg: 'Validation failed',
    key: 'error.validation',
    fields,
  });
}

async function bootstrap() {
  // Load secrets from Vault before the app starts, so ConfigModule and every
  // other module sees the vault values in process.env from the very beginning.
  await loadVaultSecrets();

  // bufferLogs: hold boot logs until the Pino logger is installed below, so the very first
  // lines are structured JSON too (no built-in-console output leaking out at startup).
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });
  app.useLogger(app.get(Logger));

  // First in the chain: mint/propagate the per-request correlation id (x-request-id) and put
  // it in AsyncLocalStorage before anything logs, so every line for the request shares it.
  app.use(requestContextMiddleware);

  // Answer vulnerability-scanner probes (root-level *.php, wp-*, /.env …)
  // with a bare 404 before they cost helmet/cookie/compression/guard work or
  // pollute the request logs — ~300/day observed from cloud-hosted scanners.
  app.use(scannerFilterMiddleware);

  // Global middleware. NOTE: under module:nodenext + esModuleInterop these CommonJS packages
  // must use default imports (`import x from 'x'`) — `import * as x` is not callable (TS2349).
  // CSP is on only in production — it blocks the Apollo Sandbox UI used in dev.
  app.use(
    helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' }),
  );
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(
    compression({
      brotli: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 5,
        },
      },
    }),
  );
  const corsOrigin =
    process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? false;
  app.enableCors({ origin: corsOrigin, credentials: true });

  // Stripe webhook needs the raw body buffer for signature verification.
  // rawBody: true in NestFactory options exposes req.rawBody as a Buffer —
  // but only for requests whose Content-Type matches Nest's default
  // json/urlencoded/text parsers (in practice, `application/json` for a JSON
  // body). Stripe sends `application/json`, so that's sufficient for it.
  //
  // LiveKit does NOT: its webhook deliveries use `application/webhook+json`
  // specifically so generic JSON middleware won't silently re-serialize the
  // body before a signature check can run. That non-standard type never
  // matches Nest's default parser, so req.rawBody was silently left
  // undefined for every real LiveKit webhook call — RtcWebhookController's
  // `rawBody?.toString() ?? ''` fell back to an empty string, whose sha256
  // never matches the real payload's, so every LiveKit webhook was rejected
  // "sha256 checksum of body does not match" (confirmed live: 100%
  // rejected, 0 ever accepted). Manually buffer the raw body for that one
  // route instead — Nest's own parser never touches this content-type, so
  // there's no double-read risk regardless of registration order.
  const RTC_WEBHOOK_MAX_BODY_BYTES = 1024 * 1024; // 1 MB — mirrors RtcWebhookController's own check
  app.use(
    '/rtc/webhook/livekit',
    (req: Request, res: Response, next: NextFunction) => {
      const chunks: Buffer[] = [];
      let bytes = 0;
      let rejected = false;
      req.on('data', (chunk: Buffer) => {
        if (rejected) return;
        bytes += chunk.length;
        if (bytes > RTC_WEBHOOK_MAX_BODY_BYTES) {
          rejected = true;
          res.status(413).json({ error: 'Request body too large' });
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', () => {
        if (rejected) return;
        (req as Request & { rawBody?: Buffer }).rawBody = Buffer.concat(chunks);
        next();
      });
      req.on('error', next);
    },
  );

  // Trust the first proxy so req.ip reflects the real client IP from X-Forwarded-For.
  // Required when running behind Nginx, Cloudflare, or any reverse proxy.
  // 1 = trust the first hop; in production behind multiple proxies use the actual count.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  app.getHttpAdapter().getInstance().set('query parser', decryptQueryString);

  // Device-IP binding: rejects requests where the device_token's stored IP doesn't match
  // the request IP. Runs after cookie-parser (needs cookies) and before validation + guards.
  const deviceIpMw = app.get(DeviceIpMiddleware);
  app.use(deviceIpMw.use.bind(deviceIpMw));

  // Run onModuleDestroy hooks (Prisma $disconnect, BullMQ close, outbox timer) on SIGTERM/SIGINT
  // — essential for clean container shutdown.
  app.enableShutdownHooks();

  // Flush OpenTelemetry spans/metrics on shutdown.
  process.on('SIGTERM', () => {
    void shutdownOpenTelemetry();
  });

  app.useGlobalInterceptors(
    new PerformanceInterceptor(),
    new IdCodecInterceptor(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  // OpenAPI / Swagger — assembled at bootstrap so the document reflects all registered routes.
  // Serves: GET /api (Swagger UI), GET /api-json, GET /api-yaml.
  // Disabled in production to prevent exposing real production endpoint/DTO shapes.
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('NestJS Boilerplate API')
      .setDescription(
        'Comprehensive NestJS 11 backend demo — REST, GraphQL, gRPC, WebSocket, CQRS, Prisma, BullMQ, and more.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  // Hybrid app: HTTP (GraphQL/REST/WS) + a gRPC microservice for internal service-to-service
  // calls. Handlers live in GrpcModule's controllers, which are demo-gated — only start this
  // transport when that module is actually loaded, or it'd listen with zero registered handlers.
  if (isDemoEnabled) {
    app.connectMicroservice(internalGrpcOptions(), { inheritAppConfig: true });
    await app.startAllMicroservices();
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
