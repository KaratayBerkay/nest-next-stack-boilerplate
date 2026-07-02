import { Module } from '@nestjs/common';
import { BrokerMessagesController } from './broker-messages.controller';
import { EventLogService } from './event-log.service';
import { MqttWildcardController } from './mqtt-wildcard.controller';
import { NatsWildcardController } from './nats-wildcard.controller';

/**
 * Microservices › alternative broker transports (#75–79). The transport is chosen at boot time
 * (`createNestMicroservice(module, options)`), so one module of handlers is proven over Redis,
 * RabbitMQ, NATS, MQTT and Kafka — see `transports.ts` for the per-broker option factories.
 *
 * Standalone: booted as a microservice only by the dedicated broker e2e specs
 * (`test/broker-*.e2e-spec.ts`, run via `pnpm test:brokers` with the brokers up). The main app is
 * HTTP/GraphQL/gRPC and never loads these — and the broker specs are excluded from the default
 * e2e suite because RabbitMQ/NATS/MQTT/Kafka aren't on the default docker profile.
 *
 * Three module variants share the core controller; NATS and MQTT add a transport-specific
 * wildcard controller (kept out of the Kafka-booted core module, whose topic names can't contain
 * the `*`/`+`/`/` characters those subjects/topics use).
 */
@Module({
  controllers: [BrokerMessagesController],
  providers: [EventLogService],
})
export class BrokerTransportsModule {}

@Module({
  controllers: [BrokerMessagesController, NatsWildcardController],
  providers: [EventLogService],
})
export class NatsBrokerModule {}

@Module({
  controllers: [BrokerMessagesController, MqttWildcardController],
  providers: [EventLogService],
})
export class MqttBrokerModule {}
