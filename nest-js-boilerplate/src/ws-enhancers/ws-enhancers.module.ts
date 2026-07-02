import { Module } from '@nestjs/common';
import { EnhancersGateway } from './enhancers.gateway';
import { WsAuthGuard } from './ws-auth.guard';
import { WsTransformInterceptor } from './ws-transform.interceptor';

/**
 * WebSockets › enhancers (#69–72): exception filters, pipes, guards and interceptors
 * on a single socket.io gateway. Class-referenced enhancers (guard, interceptor) are
 * provided here so Nest's DI can resolve them. Standalone — booted only by its e2e
 * (sharing the test HTTP port), never added to AppModule, so its event names can't
 * collide with the #68 ChatGateway.
 */
@Module({
  providers: [EnhancersGateway, WsAuthGuard, WsTransformInterceptor],
})
export class WsEnhancersModule {}
