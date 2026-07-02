import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CallProbe } from './call-probe.service';
import { ConfigService } from './config.service';
import { ReportController } from './report.controller';
import { dynamicConfigModule, StandaloneModule } from './standalone.module';
import { TasksModule } from './tasks.module';
import { TasksService } from './tasks.service';

// Proves the docs page "Standalone applications": a bare Nest application context (no network
// listeners) is a wrapper around the IoC container. We exercise every documented retrieval path —
// app.get() across modules, strict app.select().get({ strict: true }), dynamic-module selection —
// plus the two caveats: HTTP enhancers are dormant, and app.close() runs the terminating hooks.
describe('Standalone applications (#86)', () => {
  let app: INestApplicationContext;

  beforeAll(async () => {
    app = await NestFactory.createApplicationContext(StandaloneModule, {
      logger: false,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('boots a bare application context with no HTTP listener', () => {
    // INestApplicationContext is the IoC container only — it exposes no getHttpServer().
    const maybeHttp = app as unknown as { getHttpServer?: unknown };
    expect(maybeHttp.getHttpServer).toBeUndefined();
    // ...yet the container is live: a provider resolves.
    expect(app.get(TasksService)).toBeInstanceOf(TasksService);
  });

  it('app.get() queries across registered (imported) modules', () => {
    // TasksService lives in TasksModule, not the root — a non-strict get() still finds it.
    const tasks = app.get(TasksService);
    expect(tasks.runDailyReport()).toBe('tasks:daily-report:done');
  });

  it('strict mode confines the lookup to the selected module context', () => {
    // Non-strict: found by global query from the (default) root context.
    expect(app.get(TasksService)).toBeInstanceOf(TasksService);

    // Strict from the root: TasksService is registered in TasksModule, not the root → throws.
    expect(() => app.get(TasksService, { strict: true })).toThrow(
      /does not exist in the current context/,
    );

    // Strict after navigating to TasksModule: resolves the SAME singleton instance.
    const viaSelect = app
      .select(TasksModule)
      .get(TasksService, { strict: true });
    expect(viaSelect).toBe(app.get(TasksService));
  });

  it('selects a DYNAMIC module by its captured reference', () => {
    const config = app
      .select(dynamicConfigModule)
      .get(ConfigService, { strict: true });
    expect(config.getFolder()).toBe('./config');
  });

  it('does NOT run HTTP enhancers (global interceptor) for an app.get() controller', () => {
    const probe = app.get(CallProbe);
    const interceptorBefore = probe.interceptorCalls;
    const controllerBefore = probe.controllerCalls;

    const controller = app.get(ReportController);
    const result = controller.generate();

    expect(result).toBe('daily-report');
    expect(probe.controllerCalls).toBe(controllerBefore + 1); // method body ran
    expect(probe.interceptorCalls).toBe(interceptorBefore); // ...but the interceptor did not
  });

  it('runs lifecycle hooks on the terminating phase (app.close())', async () => {
    // Own context so closing it does not disturb the shared one.
    const ownApp = await NestFactory.createApplicationContext(
      StandaloneModule,
      {
        logger: false,
      },
    );
    const tasks = ownApp.get(TasksService);
    expect(tasks.destroyed).toBe(false);

    await ownApp.close();

    expect(tasks.destroyed).toBe(true); // onModuleDestroy fired
  });
});
