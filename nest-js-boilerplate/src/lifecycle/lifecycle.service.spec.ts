import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { LifecycleModule } from './lifecycle.module';
import { LifecycleService } from './lifecycle.service';

// Proves the documented lifecycle ORDER actually holds — not just that the hooks compile.
describe('Lifecycle hooks (ordering)', () => {
  let app: INestApplication;
  let service: LifecycleService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [LifecycleModule],
    }).compile();
    app = moduleRef.createNestApplication();
    // Required for the termination hooks (beforeApplicationShutdown / onApplicationShutdown)
    // to be wired; app.close() then drives the full teardown sequence below.
    app.enableShutdownHooks();
    service = app.get(LifecycleService);
  });

  it('fires no hooks before the app is initialized', () => {
    expect(service.events).toEqual([]);
  });

  it('runs bootstrap hooks in order on init()', async () => {
    await app.init();
    expect(service.events).toEqual(['onModuleInit', 'onApplicationBootstrap']);
  });

  it('runs termination hooks in order on close()', async () => {
    await app.close();
    expect(service.events).toEqual([
      'onModuleInit',
      'onApplicationBootstrap',
      'onModuleDestroy',
      'beforeApplicationShutdown',
      'onApplicationShutdown',
    ]);
  });
});
