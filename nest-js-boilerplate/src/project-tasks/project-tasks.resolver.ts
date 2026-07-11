import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
// Object type is auto-generated from the Prisma schema.
import { Task } from '../@generated/task/task.model';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CreateTaskInput } from './dto/create-task.input';
import { ProjectTasksService } from './project-tasks.service';

// Domain `Task` resolver (the project/issue entity) — distinct from src/tasks, which is the
// @nestjs/schedule (Cron/Interval) demo. Exercises GraphQL through 3-level FK depth
// (Task -> Project -> Organization -> User) and proves the @MinLength/@MaxLength validators
// auto-generated from the Prisma schema onto Task.title. Guarded so a session is required.
@UseGuards(SessionAuthGuard)
@Resolver(() => Task)
export class ProjectTasksResolver {
  constructor(private readonly tasks: ProjectTasksService) {}

  @Query(() => [Task], { name: 'tasks' })
  findAll() {
    return this.tasks.findAll();
  }

  @Mutation(() => Task)
  createTask(
    @CurrentUser() user: JwtUser,
    @Args('data') data: CreateTaskInput,
  ) {
    return this.tasks.create(user.userId, data);
  }
}
