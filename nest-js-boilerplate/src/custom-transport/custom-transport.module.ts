import { Module } from '@nestjs/common';
import { CustomTransportController } from './custom-transport.controller';
import { EventStore } from './event-store.service';

/**
 * custom transporter (#81) — the microservice module booted with our custom strategy via
 * `NestFactory.createMicroservice(CustomTransportModule, { strategy: new InMemoryServer(broker) })`.
 * Standalone: it has no HTTP surface and is not imported by `AppModule`.
 */
@Module({
  controllers: [CustomTransportController],
  providers: [EventStore],
})
export class CustomTransportModule {}
