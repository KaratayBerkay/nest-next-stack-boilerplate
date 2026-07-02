import { Module } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import type { TcpOptions } from '@nestjs/microservices';
import { EventLogService } from './event-log.service';
import { MicroservicesController } from './microservices.controller';
import { RpcAuthGuard } from './rpc-auth.guard';

/**
 * Reusable TCP transport options shared by the server (`createMicroservice` /
 * `connectMicroservice`) and clients/tests. TCP is the default transporter and needs no
 * external broker, so the whole enhancer suite (#74, #82–85) is provable in-process.
 */
export const tcpOptions = (port = 8877, host = '127.0.0.1'): TcpOptions => ({
  transport: Transport.TCP,
  options: { host, port },
});

/**
 * Microservices › Overview + enhancers (#74, #82–85). A self-contained TCP microservice: one
 * controller hosting request-response (`@MessagePattern`) and event-based (`@EventPattern`)
 * handlers, each proving a documented enhancer. The class-referenced `RpcAuthGuard` is provided
 * for DI; filters/pipes/interceptors are method-scoped `new` instances (docs style). Standalone
 * — booted as a microservice only by its e2e (the main app is HTTP/GraphQL/gRPC).
 */
@Module({
  controllers: [MicroservicesController],
  providers: [EventLogService, RpcAuthGuard],
})
export class MicroservicesModule {}
