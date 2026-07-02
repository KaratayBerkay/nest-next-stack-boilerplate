import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';

/**
 * Standalone applications (#86) — a static feature module imported by `StandaloneModule`. Because
 * `TasksService` is registered here (and not in the root), it is the subject of the strict-vs-non-
 * strict retrieval demonstration: `app.get(TasksService)` finds it globally, but
 * `app.get(TasksService, { strict: true })` from the root context does not.
 */
@Module({
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
