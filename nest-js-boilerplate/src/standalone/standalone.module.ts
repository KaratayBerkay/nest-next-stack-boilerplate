import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './audit.interceptor';
import { CallProbe } from './call-probe.service';
import { ConfigModule } from './config.module';
import { ReportController } from './report.controller';
import { TasksModule } from './tasks.module';

/**
 * Standalone applications (#86) — the root module booted via
 * `NestFactory.createApplicationContext(StandaloneModule)` (no HTTP server).
 *
 * `dynamicConfigModule` mirrors the docs' dynamic-module example: the module value is captured in a
 * constant so the SAME reference can be handed to `app.select(dynamicConfigModule)` later (dynamic
 * modules cannot be selected by their class alone).
 */
export const dynamicConfigModule = ConfigModule.register({
  folder: './config',
});

@Module({
  imports: [TasksModule, dynamicConfigModule],
  controllers: [ReportController],
  providers: [
    CallProbe,
    // A *global* interceptor — deliberately dormant in a standalone context (no request pipeline).
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class StandaloneModule {}
