import { Controller, Get, Header } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';

/**
 * Exposes Prometheus metrics at GET /metrics.
 *
 * Kept off the main GraphQL/REST port in production by mounting on a separate
 * path — in a real deployment, reverse-proxy this to an internal-only port.
 * For local dev and Docker, it's accessible at http://localhost:3000/metrics.
 */
@Controller()
export class MetricsController {
  constructor(private readonly prometheus: PrometheusService) {}

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics(): Promise<string> {
    return this.prometheus.register.metrics();
  }
}
