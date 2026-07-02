import { Module } from '@nestjs/common';
import { ContextProbeInterceptor } from './context-probe.interceptor';
import { ExecutionContextController } from './execution-context.controller';

// Standalone demo of the ExecutionContext/ArgumentsHost + Reflector APIs.
@Module({
  controllers: [ExecutionContextController],
  providers: [ContextProbeInterceptor],
})
export class ExecutionContextModule {}
