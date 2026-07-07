import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { internalGrpcOptions } from './grpc/grpc.module';
import { requestContextMiddleware } from './logging/request-context';
import { DeviceIpMiddleware } from './devices/device-ip-middleware';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';

async function bootstrap() {
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

  // Global middleware. NOTE: under module:nodenext + esModuleInterop these CommonJS packages
  // must use default imports (`import x from 'x'`) — `import * as x` is not callable (TS2349).
  // CSP is on only in production — it blocks the Apollo Sandbox UI used in dev.
  app.use(
    helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' }),
  );
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(compression());
  app.enableCors({ origin: true, credentials: true });

  // Stripe webhook needs the raw body buffer for signature verification.
  // rawBody: true in NestFactory options exposes req.rawBody as a Buffer.

  // Trust the first proxy so req.ip reflects the real client IP from X-Forwarded-For.
  // Required when running behind Nginx, Cloudflare, or any reverse proxy.
  // 1 = trust the first hop; in production behind multiple proxies use the actual count.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Device-IP binding: rejects requests where the device_token's stored IP doesn't match
  // the request IP. Runs after cookie-parser (needs cookies) and before validation + guards.
  const deviceIpMw = app.get(DeviceIpMiddleware);
  app.use(deviceIpMw.use.bind(deviceIpMw));

  // Run onModuleDestroy hooks (Prisma $disconnect, BullMQ close, outbox timer) on SIGTERM/SIGINT
  // — essential for clean container shutdown.
  app.enableShutdownHooks();

  app.useGlobalInterceptors(new PerformanceInterceptor());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // OpenAPI / Swagger — assembled at bootstrap so the document reflects all registered routes.
  // Serves: GET /api (Swagger UI), GET /api-json, GET /api-yaml.
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

  // Hybrid app: HTTP (GraphQL/REST/WS) + a gRPC microservice for internal service-to-service
  // calls. Handlers live in GrpcModule's controllers and share this app's DI container.
  app.connectMicroservice(internalGrpcOptions(), { inheritAppConfig: true });
  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
