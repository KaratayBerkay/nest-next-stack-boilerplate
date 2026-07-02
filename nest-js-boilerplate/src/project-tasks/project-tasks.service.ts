import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskInput } from './dto/create-task.input';

@Injectable()
export class ProjectTasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.task.findMany({ orderBy: { createdAt: 'asc' } });
  }

  create(creatorId: string, data: CreateTaskInput) {
    // Flat scalar FK ids -> Prisma nested `connect`s. Creator comes from the JWT.
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        project: { connect: { id: data.projectId } },
        createdBy: { connect: { id: creatorId } },
        ...(data.assigneeId && {
          assignee: { connect: { id: data.assigneeId } },
        }),
      },
    });
  }
}
