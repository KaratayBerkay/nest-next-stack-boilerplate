import { Injectable, Logger } from '@nestjs/common';
import { Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';

// Demonstrates @nestjs/schedule: declarative @Interval/@Timeout jobs plus dynamic
// job management through SchedulerRegistry. ScheduleModule.forRoot() must be imported by the
// hosting application (AppModule / the test module) for these decorators to be discovered.
//
// NOTE: @Cron deliberately omitted. The `cron` package can compute a negative setTimeout delay
// when the system clock jumps (e.g. DST, NTP sync), producing a `TimeoutNegativeWarning` and
// causing immediate re-fires. @Interval uses a fixed ms value — no date math, no negative delay.
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

  @Interval('demo-cron', 30 * 60 * 1000)
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
