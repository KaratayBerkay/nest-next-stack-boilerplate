import { INestApplication } from '@nestjs/common';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { Test } from '@nestjs/testing';
import { DemoTasksModule } from './tasks.module';
import { DemoTasksService } from './tasks.service';

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Proves @nestjs/schedule actually fires jobs (compiling the decorators isn't enough) and
// that the dynamic SchedulerRegistry API works.
describe('DemoTasksService (scheduling)', () => {
  let app: INestApplication;
  let service: DemoTasksService;
  let registry: SchedulerRegistry;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ScheduleModule.forRoot(), DemoTasksModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    service = app.get(DemoTasksService);
    registry = app.get(SchedulerRegistry);
  });

  afterAll(async () => {
    await app.close();
  });

  it('runs @Interval jobs repeatedly and fires an @Timeout once', async () => {
    await sleep(350);
    expect(service.getIntervalTicks()).toBeGreaterThanOrEqual(2);
    expect(service.hasTimedOut()).toBe(true);
  });

  it('registers the declarative jobs in the SchedulerRegistry', () => {
    expect(registry.getIntervals()).toContain('demo-interval');
    expect(registry.getIntervals()).toContain('demo-cron');
  });

  it('supports dynamic interval add/list/delete via the registry', () => {
    service.addDynamicInterval('dynamic-1', 1000);
    expect(service.listIntervals()).toContain('dynamic-1');
    service.deleteDynamicInterval('dynamic-1');
    expect(service.listIntervals()).not.toContain('dynamic-1');
  });
});
