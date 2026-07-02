import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

const HEAP_LIMIT = 512 * 1024 * 1024; // 512 MB

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly db: PrismaService,
  ) {}

  // Liveness — is the process itself healthy? No external deps, so a failure here means
  // "restart the container" rather than "stop sending traffic".
  @Get()
  @HealthCheck()
  live(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', HEAP_LIMIT),
    ]);
  }

  // Readiness — can we actually serve requests? Pings the database so a load balancer / k8s
  // stops routing while the DB is unreachable.
  @Get('ready')
  @HealthCheck()
  ready(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prisma.pingCheck('database', this.db),
      () => this.memory.checkHeap('memory_heap', HEAP_LIMIT),
    ]);
  }
}
