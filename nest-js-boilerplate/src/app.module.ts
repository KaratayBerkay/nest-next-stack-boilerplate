import { join } from 'node:path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlsModule } from './als/als.module';
import { AuthModule } from './auth/auth.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { ComplexityModule } from './complexity/complexity.module';
import { ComplexityPlugin } from './complexity/complexity.plugin';
import { CompressionModule } from './compression/compression.module';
import { CookiesModule } from './cookies/cookies.module';
import { CookiesSsrModule } from './cookies-ssr/cookies-ssr.module';
import { CorsModule } from './cors/cors.module';
import { CryptoModule } from './common/crypto/crypto.module';
import { CqrsExampleModule } from './cqrs/cqrs.module';
import { CsrfModule } from './csrf/csrf.module';
import { ExceptionFiltersModule } from './exception-filters/exception-filters.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
      // In production (k8s pods run with a read-only root filesystem) generate the SDL
      // in-memory so nothing is written to disk; in dev write it to src/schema.gql so it can
      // be committed / fed to frontend codegen. `true` => keep the schema in memory only.
      autoSchemaFile:
        process.env.NODE_ENV === 'production'
          ? true
          : join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      // Enable real-time subscriptions over the modern graphql-ws protocol (served on
      // the same /graphql path as queries/mutations). See SubscriptionsModule.
      subscriptions: {
        'graphql-ws': true,
      },
      // Apply the custom @upper schema directive. The transformer only touches fields that
      // carry the directive, so it is a no-op for the rest of the schema. See DirectivesModule.
      transformSchema: (schema) => upperDirectiveTransformer(schema, 'upper'),
      buildSchemaOptions: {
        directives: [
          new GraphQLDirective({
            name: 'upper',
            locations: [DirectiveLocation.FIELD_DEFINITION],
          }),
        ],
      },
      // Run interceptors (not just guards/filters) on @ResolveField methods too, not only on
      // top-level @Query/@Mutation. Opt-in per resolver via @UseInterceptors. See GraphqlOtherModule.
      fieldResolverEnhancers: ['interceptors'],
    }),
    // Rate limiting: generous global default (per-IP, per-route); tight per-route overrides
    // live on individual handlers via @Throttle. Bound via HttpThrottlerGuard below.
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 120 }] }),
    // Cron/interval/timeout scheduling — registered once at the root.
    ScheduleModule.forRoot(),
    // Structured Pino logging (replaces the built-in console Logger app-wide).
    LoggingModule,
    PrismaModule,
    CryptoModule,
    OutboxModule,
    MailModule,
    UsersModule,
    AuthModule,
    AuthorizationModule,
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
    GrpcModule,
    CookiesModule,
    CookiesSsrModule,
    CompressionModule,
    CorsModule,
    CsrfModule,
    OpenapiModule,
    UploadModule,
    TasksModule,
    ThrottleModule,
    HealthModule,
    RedisModule,
    ExceptionFiltersModule,
    InterceptorsModule,
    PipesModule,
    SerializationModule,
    MiddlewareModule,
    PassportAuthModule,
    CqrsExampleModule,
    AlsModule,
    StaticAssetsModule,
    RouterDemoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global rate-limiting guard (skips non-HTTP transports — see HttpThrottlerGuard).
    { provide: APP_GUARD, useClass: HttpThrottlerGuard },
    // GraphQL query-complexity guard. Registered here (not in ComplexityModule) because it
    // injects GraphQLModule's exported GraphQLSchemaHost, only visible in this scope.
    ComplexityPlugin,
  ],
})
export class AppModule {}
