import { UseGuards } from '@nestjs/common';
import { Query, Resolver, Args, Int } from '@nestjs/graphql';
import { AuditLog } from '../@generated/audit-log/audit-log.model';
import { AuditLogWhereInput } from '../@generated/audit-log/audit-log-where.input';
import { AuditLogOrderByWithRelationInput } from '../@generated/audit-log/audit-log-order-by-with-relation.input';
import { UserRole } from '../@generated/prisma/user-role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { SessionAuthGuard } from '../auth/session-auth.guard';

@UseGuards(SessionAuthGuard, RolesGuard)
@Resolver(() => AuditLog)
export class AuditLogResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Query(() => [AuditLog], { name: 'auditLogs' })
  async auditLogs(
    @Args('where', { nullable: true }) where?: AuditLogWhereInput,
    @Args('orderBy', { nullable: true })
    orderBy?: AuditLogOrderByWithRelationInput[],
    @Args('take', { nullable: true }) take?: number,
    @Args('skip', { nullable: true }) skip?: number,
  ): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: where as never,
      orderBy: orderBy ?? [{ createdAt: 'desc' }],
      take: Math.min(take ?? 50, 100),
      skip: skip ?? 0,
      include: { actor: true },
    });
  }

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Query(() => Int, { name: 'auditLogCount' })
  async auditLogCount(
    @Args('where', { nullable: true }) where?: AuditLogWhereInput,
  ): Promise<number> {
    return this.prisma.auditLog.count({ where: where as never });
  }
}
