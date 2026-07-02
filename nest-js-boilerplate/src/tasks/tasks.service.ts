import { Injectable, Logger } from '@nestjs/common';
import {
  Cron,
  CronExpression,
  Interval,
  SchedulerRegistry,
  Timeout,
} from '@nestjs/schedule';

// Demonstrates @nestjs/schedule: declarative @Cron/@Interval/@Timeout jobs plus dynamic
// job management through SchedulerRegistry. ScheduleModule.forRoot() must be imported by the
// hosting application (AppModule / the test module) for these decorators to be discovered.
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private intervalTicks = 0;
  private timedOut = false;

  constructor(private readonly registry: SchedulerRegistry) {}

  @Interval('demo-interval', 100)
  handleInterval(): void {
    this.intervalTicks += 1;
  }

  @Timeout('demo-timeout', 50)
  handleTimeout(): void {
    this.timedOut = true;
  }

  @Cron(CronExpression.EVERY_30_MINUTES, { name: 'demo-cron' })
  handleCron(): void {
    this.logger.debug('demo-cron fired');
  }

  getIntervalTicks(): number {
    return this.intervalTicks;
  }

  hasTimedOut(): boolean {
    return this.timedOut;
  }

  // --- Dynamic API via SchedulerRegistry ---
  addDynamicInterval(name: string, ms: number): void {
    const id = setInterval(() => {
      this.intervalTicks += 1;
    }, ms);
    this.registry.addInterval(name, id);
  }

  deleteDynamicInterval(name: string): void {
    // deleteInterval also clears the underlying timer.
    this.registry.deleteInterval(name);
  }

  listIntervals(): string[] {
    return this.registry.getIntervals();
  }

  listCronJobs(): string[] {
    return [...this.registry.getCronJobs().keys()];
  }
}
