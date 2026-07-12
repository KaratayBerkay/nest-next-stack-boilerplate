import { join } from 'node:path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlsModule } from './als/als.module';
import { AuthModule } from './auth/auth.module';
import { VaultModule } from './vault/vault.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { BillingModule } from './billing/billing.module';
import { StripeModule } from './billing/stripe/stripe.module';
import { ComplexityModule } from './complexity/complexity.module';
import { ComplexityPlugin } from './complexity/complexity.plugin';
import { CompressionModule } from './compression/compression.module';
import { CookiesModule } from './cookies/cookies.module';
import { CookiesSsrModule } from './cookies-ssr/cookies-ssr.module';
import { CorsModule } from './cors/cors.module';
import { CryptoModule } from './common/crypto/crypto.module';
import { DataloaderModule } from './common/dataloader/dataloader.module';
import { CqrsExampleModule } from './cqrs/cqrs.module';
import { CsrfModule } from './csrf/csrf.module';
import { ExceptionFiltersModule } from './exception-filters/exception-filters.module';
import { GlobalHttpExceptionFilter } from './exception-filters/global-http-exception.filter';
import { toExceptionResponse } from './common/exceptions/to-exception-response';
import { ExtensionsModule } from './extensions/extensions.module';
import { FieldMiddlewareModule } from './field-middleware/field-middleware.module';
import { GraphqlOtherModule } from './graphql-other/graphql-other.module';
import { GrpcModule } from './grpc/grpc.module';
import { HealthModule } from './health/health.module';
import { RedisModule } from './redis/redis.module';
import { InterceptorsModule } from './interceptors/interceptors.module';
import { InterfacesModule } from './interfaces/interfaces.module';
import { PipesModule } from './pipes/pipes.module';
import { LoggingModule } from './logging/logging.module';
import { MailModule } from './mail/mail.module';
import { MfaModule } from './mfa/mfa.module';
import { MessagingModule } from './messaging/messaging.module';
import { RealtimeModule } from './realtime/realtime.module';
import { OpenapiModule } from './openapi/openapi.module';
import { MiddlewareModule } from './middleware/middleware.module';
import { OutboxModule } from './outbox/outbox.module';
import { PassportAuthModule } from './passport-auth/passport-auth.module';
import { PluginsModule } from './plugins/plugins.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectTasksModule } from './project-tasks/project-tasks.module';
import { DirectivesModule } from './directives/directives.module';
import { upperDirectiveTransformer } from './directives/upper-directive.transformer';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { NotificationModule } from './notification/notification.module';
import { PushNotificationModule } from './push-notification/push-notification.module';
import { ReactionsModule } from './reactions/reactions.module';
import { RouterDemoModule } from './router-module/router-demo.module';
import { ScalarsModule } from './scalars/scalars.module';
import { SerializationModule } from './serialization/serialization.module';
import { StaticAssetsModule } from './serve-static/serve-static.module';
import { SharingModelsModule } from './sharing-models/sharing-models.module';
import { ProfileModule } from './profile/profile.module';
import { SessionsModule } from './sessions/sessions.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { SseModule } from './sse/sse.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TasksModule } from './tasks/tasks.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { UnionsEnumsModule } from './unions-enums/unions-enums.module';
import { ThrottleModule } from './throttle/throttle.module';
import { HttpThrottlerGuard } from './throttle/http-throttler.guard';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { WsModule } from './ws/ws.module';
import { validationSchema, validationOptions } from './config/env.validation';

// ── Core modules — always loaded in production ──────────────────────────────
const CORE_MODULES = [
  ConfigModule.forRoot({ isGlobal: true, validationSchema, validationOptions }),
  BullModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      connection: {
        host: config.get<string>('REDIS_HOST', 'localhost'),
        port: Number(config.get('REDIS_PORT') ?? 6379),
      },
    }),
  }),
  GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    autoSchemaFile:
      process.env.NODE_ENV === 'production'
        ? true
        : join(process.cwd(), 'src/schema.gql'),
    sortSchema: true,
    context: ({ req, res }: { req: unknown; res: unknown }) => ({
      req,
      res,
    }),
    subscriptions: {
      'graphql-ws': true,
    },
    transformSchema: (schema) => upperDirectiveTransformer(schema, 'upper'),
    buildSchemaOptions: {
      directives: [
        new GraphQLDirective({
          name: 'upper',
          locations: [DirectiveLocation.FIELD_DEFINITION],
        }),
      ],
    },
    fieldResolverEnhancers: ['interceptors'],
    formatError: (formattedError, error: unknown) => {
      const gqlErr = error as { originalError?: unknown };
      const original = gqlErr.originalError ?? error;
      const unified = toExceptionResponse(original);
      return {
        ...formattedError,
        extensions: {
          ...formattedError.extensions,
          ...unified,
        },
      };
    },
  }),
  ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 120 }] }),
  ScheduleModule.forRoot(),
  LoggingModule,
  PrismaModule,
  CryptoModule,
  OutboxModule,
  MailModule,
  AuthModule,
  AuthorizationModule,
  StripeModule,
  BillingModule,
  ProjectTasksModule,
  PostModule,
  CommentModule,
  NotificationModule,
  PushNotificationModule,
  ReactionsModule,
  TeamMembersModule,
  MfaModule,
  MessagingModule,
  RealtimeModule,
  ProfileModule,
  SessionsModule,
  ApiKeysModule,
  UploadModule,
  VaultModule,
  HealthModule,
  RedisModule,
  CsrfModule,
  DataloaderModule,
];

// ── Demo modules — NestJS docs examples, gated behind LOAD_DEMO_MODULES ────
// These are standalone demos (gRPC, SSE, CORS, CQRS, etc.) that should not be
// part of a production build. Set LOAD_DEMO_MODULES=true to include them.
const DEMO_MODULES = [
  UsersModule, // demo CRUD module — leaks passwordHash; must not run in production
  GrpcModule,
  CqrsExampleModule,
  RouterDemoModule,
  TasksModule,
  ComplexityModule,
  DirectivesModule,
  ExtensionsModule,
  FieldMiddlewareModule,
  GraphqlOtherModule,
  InterfacesModule,
  PluginsModule,
  ScalarsModule,
  SharingModelsModule,
  SseModule,
  SubscriptionsModule,
  UnionsEnumsModule,
  WsModule,
  CookiesModule,
  CookiesSsrModule,
  CompressionModule,
  CorsModule,
  OpenapiModule,
  ThrottleModule,
  ExceptionFiltersModule,
  InterceptorsModule,
  PipesModule,
  SerializationModule,
  MiddlewareModule,
  PassportAuthModule,
  AlsModule,
  StaticAssetsModule,
];

const isDemoEnabled =
  process.env.LOAD_DEMO_MODULES === 'true' ||
  process.env.NODE_ENV === 'development';

@Module({
  imports: [...CORE_MODULES, ...(isDemoEnabled ? DEMO_MODULES : [])],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: HttpThrottlerGuard },
    { provide: APP_FILTER, useClass: GlobalHttpExceptionFilter },
    ComplexityPlugin,
  ],
})
export class AppModule {}
