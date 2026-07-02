import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProjectTasksResolver } from './project-tasks.resolver';
import { ProjectTasksService } from './project-tasks.service';

// AuthModule exports JwtAuthGuard (+ JwtModule) used by the @UseGuards on the resolver.
@Module({
  imports: [AuthModule],
  providers: [ProjectTasksResolver, ProjectTasksService],
})
export class ProjectTasksModule {}
