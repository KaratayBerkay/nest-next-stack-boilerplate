import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ElasticsearchService } from './elasticsearch.service';
import { OUTBOX_QUEUE } from './outbox.constants';
import { DomainEvent } from './domain-event';

interface OutboxJob {
  outboxId: string;
  event: DomainEvent;
}

/**
 * Consumes relayed outbox events from the broker and writes the durable AuditLog row.
 * This is the single place logs are persisted — and the natural hook point for shipping
 * the same event to Elasticsearch (see {@link exportToSearch}).
 */
@Processor(OUTBOX_QUEUE)
export class AuditLogProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditLogProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearch: ElasticsearchService,
  ) {
    super();
  }

  async process(job: Job<OutboxJob>): Promise<void> {
    const e = job.data.event;

    const audit = await this.createAuditLog({
      action: e.action,
      level: e.level ?? 'INFO',
      entityType: e.aggregateType,
      entityId: e.aggregateId,
      summary: e.summary ?? null,
      actorId: e.actorId ?? null,
      organizationId: e.organizationId ?? null,
      before: this.toJson(e.before),
      after: this.toJson(e.after),
      ip: e.ip ?? null,
      userAgent: e.userAgent ?? null,
      requestId: e.requestId ?? null,
      correlationId: e.correlationId ?? null,
    });

    await this.exportToSearch(audit.id, e);
  }

  private async createAuditLog(data: Prisma.AuditLogUncheckedCreateInput) {
    try {
      return await this.prisma.auditLog.create({ data });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003' &&
        data.actorId
      ) {
        this.logger.warn(
          `actorId ${JSON.stringify(data.actorId)} no longer exists — retrying with null`,
        );
        return await this.prisma.auditLog.create({
          data: { ...data, actorId: null },
        });
      }
      throw err;
    }
  }

  /**
   * Elasticsearch export hook. Indexes the audit event into the `audit-logs` index.
   * ES indexing is fire-and-forget — failures are logged but never thrown, so a
   * down ES cluster never blocks the audit-log worker.
   */
  private exportToSearch(auditId: string, event: DomainEvent): Promise<void> {
    return this.elasticsearch.index('audit-logs', auditId, {
      action: event.action,
      level: event.level ?? 'INFO',
      entityType: event.aggregateType,
      entityId: event.aggregateId,
      summary: event.summary,
      actorId: event.actorId,
      organizationId: event.organizationId,
      ip: event.ip,
      userAgent: event.userAgent,
      requestId: event.requestId,
      correlationId: event.correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  private toJson(value: unknown): Prisma.InputJsonValue | undefined {
    if (value === undefined || value === null) return undefined;
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
