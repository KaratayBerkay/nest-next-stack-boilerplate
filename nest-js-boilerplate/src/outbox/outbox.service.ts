import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { getRequestId } from '../logging/request-context';
import { DomainEvent } from './domain-event';

interface ClaimedRow {
  id: string;
  eventType: string;
  payload: DomainEvent;
  attempts: number;
}

/**
 * Transactional outbox.
 *
 *  - {@link emit} writes an OutboxEvent row. Pass the active Prisma transaction client so
 *    the event commits atomically with the domain change (the whole point of the pattern).
 *  - {@link relayPendingEvents} claims PENDING events with `FOR UPDATE SKIP LOCKED`, pushes
 *    them onto the BullMQ (Redis) broker, and marks them PUBLISHED. A worker then fans them
 *    out to AuditLog / Elasticsearch. Request handlers never write logs inline.
 *
 * A lightweight poller drives the relay on an interval (OUTBOX_POLL_MS); it is also exposed
 * for on-demand draining (used by tests).
 */
@Injectable()
export class OutboxService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxService.name);
  private timer?: NodeJS.Timeout;
  private readonly maxAttempts: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @InjectQueue(/* OUTBOX_QUEUE */ 'outbox') private readonly queue: Queue,
  ) {
    this.maxAttempts = Number(this.config.get('OUTBOX_MAX_ATTEMPTS') ?? 5);
  }

  onModuleInit(): void {
    const intervalMs = Number(this.config.get('OUTBOX_POLL_MS') ?? 2000);
    if (intervalMs > 0) {
      this.timer = setInterval(() => {
        void this.relayPendingEvents().catch((err) =>
          this.logger.error('Outbox relay failed', err as Error),
        );
      }, intervalMs);
      this.timer.unref(); // don't keep the event loop / Jest alive
    }
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /** Persist a domain event. Defaults to the shared client; pass `tx` to enroll it in a transaction. */
  async emit(
    event: DomainEvent,
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    // Stamp the current request's correlation id (unless the caller set one explicitly) so the
    // resulting AuditLog row joins to the app's Pino log lines for the same request.
    const requestId = getRequestId();
    const enriched: DomainEvent = {
      ...event,
      requestId: event.requestId ?? requestId ?? null,
      correlationId: event.correlationId ?? requestId ?? null,
    };
    await client.outboxEvent.create({
      data: {
        aggregateType: enriched.aggregateType,
        aggregateId: enriched.aggregateId,
        eventType: enriched.eventType,
        payload: this.toJson(enriched),
      },
    });
  }

  /** Claim a batch of PENDING events and publish them to the broker. Returns how many were published. */
  async relayPendingEvents(batchSize = 100): Promise<number> {
    // First, reclaim any rows stuck in PUBLISHING (process killed mid-relay).
    // Rows older than 5 minutes are presumed abandoned.
    const reclaimed = await this.prisma.$executeRaw`
      UPDATE "OutboxEvent"
      SET status = 'PENDING', attempts = attempts + 1,
          lastError = 'reclaimed from PUBLISHING (stale > 5m)'
      WHERE status = 'PUBLISHING'
        AND "updatedAt" < now() - interval '5 minutes'
    `;
    if (reclaimed > 0) {
      this.logger.warn(
        `Reclaimed ${reclaimed} stale PUBLISHING outbox row(s)`,
      );
    }

    const claimed = await this.prisma.$queryRaw<ClaimedRow[]>(Prisma.sql`
      UPDATE "OutboxEvent" SET status = 'PUBLISHING'
      WHERE id IN (
        SELECT id FROM "OutboxEvent"
        WHERE status = 'PENDING' AND "availableAt" <= now()
        ORDER BY "createdAt" ASC
        LIMIT ${batchSize}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id, "eventType", payload, attempts;
    `);

    let published = 0;
    for (const row of claimed) {
      // Dead-letter cutoff: stop retrying events that have exceeded maxAttempts.
      if (row.attempts >= this.maxAttempts) {
        await this.prisma.outboxEvent.update({
          where: { id: row.id },
          data: { status: 'DEAD_LETTER' },
        });
        this.logger.warn(
          `Outbox event ${row.id} (${row.eventType}) moved to DEAD_LETTER after ${row.attempts} attempts`,
        );
        continue;
      }

      try {
        await this.queue.add(
          row.eventType,
          { outboxId: row.id, event: row.payload },
          {
            removeOnComplete: 1000,
            removeOnFail: 5000,
            attempts: 5,
            backoff: { type: 'exponential', delay: 1000 },
          },
        );
        await this.prisma.outboxEvent.update({
          where: { id: row.id },
          data: { status: 'PUBLISHED', publishedAt: new Date() },
        });
        published++;
      } catch (err) {
        const newAttempts = row.attempts + 1;
        if (newAttempts >= this.maxAttempts) {
          await this.prisma.outboxEvent.update({
            where: { id: row.id },
            data: {
              status: 'DEAD_LETTER',
              lastError: err instanceof Error ? err.message : String(err),
            },
          });
          this.logger.warn(
            `Outbox event ${row.id} (${row.eventType}) moved to DEAD_LETTER after ${newAttempts} attempts`,
          );
        } else {
          // Couldn't reach the broker — release back to PENDING for the next relay tick.
          await this.prisma.outboxEvent.update({
            where: { id: row.id },
            data: {
              status: 'PENDING',
              attempts: { increment: 1 },
              lastError: err instanceof Error ? err.message : String(err),
            },
          });
        }
      }
    }
    return published;
  }

  // Round-trips through JSON so `undefined` is dropped and the value is a valid Prisma Json input.
  private toJson(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
