import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';

// ScheduleModule.forRoot() is registered once at the root (AppModule). This module only owns
// the scheduled provider so it stays self-contained and independently testable.
@Module({ providers: [TasksService], exports: [TasksService] })
export class TasksModule {}
