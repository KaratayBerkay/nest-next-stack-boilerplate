import { Module } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';
import { MetricsController } from './metrics.controller';

/**
 * Telemetry module — Prometheus metrics collection and exposition.
 *
 * Imported by AppModule; the MetricsController registers the `/metrics` route.
 * OpenTelemetry tracing is initialized separately in `main.ts` (before the
 * NestJS DI container boots) so all instrumentations are active from the start.
 */
@Module({
  controllers: [MetricsController],
  providers: [PrometheusService],
  exports: [PrometheusService],
})
export class TelemetryModule {}
