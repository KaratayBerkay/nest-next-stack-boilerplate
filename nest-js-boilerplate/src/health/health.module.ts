import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

// Liveness/readiness probes. PrismaService comes from the @Global PrismaModule.
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
