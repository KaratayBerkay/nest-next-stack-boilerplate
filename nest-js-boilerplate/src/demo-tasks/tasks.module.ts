import { Module } from '@nestjs/common';
import { DemoTasksService } from './tasks.service';

// ScheduleModule.forRoot() is registered once at the root (AppModule). This module only owns
// the scheduled provider so it stays self-contained and independently testable.
@Module({ providers: [DemoTasksService], exports: [DemoTasksService] })
export class DemoTasksModule {}
