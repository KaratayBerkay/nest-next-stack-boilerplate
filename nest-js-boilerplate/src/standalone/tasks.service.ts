import { Injectable, OnModuleDestroy } from '@nestjs/common';

/**
 * Standalone applications (#86) — the docs' canonical "TasksService we want to call from a CRON
 * job" provider. It lives in {@link TasksModule} (imported by the root `StandaloneModule`), so
 * retrieving it proves `app.get()` queries across *registered* modules, not just the root.
 * `onModuleDestroy` records the terminating phase: the docs promise `app.close()` fires lifecycle
 * hooks even in a standalone context.
 */
@Injectable()
export class TasksService implements OnModuleDestroy {
  destroyed = false;

  runDailyReport(): string {
    return 'tasks:daily-report:done';
  }

  onModuleDestroy(): void {
    this.destroyed = true;
  }
}
