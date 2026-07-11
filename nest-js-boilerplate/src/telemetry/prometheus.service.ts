import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

/**
 * Prometheus metrics service.
 *
 * Exposes a dedicated `Registry` so the `/metrics` endpoint can serialize it
 * without pulling in NestJS's default metrics. Default Node.js metrics
 * (event loop lag, GC, memory, CPU) are collected automatically.
 */
@Injectable()
export class PrometheusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrometheusService.name);
  readonly register = new Registry();
  private collectDefaults?: ReturnType<typeof collectDefaultMetrics>;

  // ── Application metrics ────────────────────────────────────────────────

  readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'] as const,
    registers: [this.register],
  });

  readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'] as const,
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
    registers: [this.register],
  });

  readonly graphqlOperationsTotal = new Counter({
    name: 'graphql_operations_total',
    help: 'Total number of GraphQL operations',
    labelNames: ['operation_type', 'operation_name', 'status'] as const,
    registers: [this.register],
  });

  readonly outboxEventsTotal = new Counter({
    name: 'outbox_events_total',
    help: 'Total outbox events processed',
    labelNames: ['event_type', 'status'] as const,
    registers: [this.register],
  });

  readonly outboxDeadLetterTotal = new Counter({
    name: 'outbox_dead_letter_total',
    help: 'Total outbox events moved to DEAD_LETTER',
    labelNames: ['event_type'] as const,
    registers: [this.register],
  });

  readonly activeSessions = new Gauge({
    name: 'active_sessions',
    help: 'Number of active Redis sessions',
    registers: [this.register],
  });

  onModuleInit(): void {
    this.collectDefaults = collectDefaultMetrics({ register: this.register });
    this.logger.log('Prometheus metrics initialized');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.collectDefaults) {
      this.collectDefaults();
    }
  }
}
