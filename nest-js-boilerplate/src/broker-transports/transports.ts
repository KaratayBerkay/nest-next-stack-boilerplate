import { Transport } from '@nestjs/microservices';
import type {
  KafkaOptions,
  MqttOptions,
  NatsOptions,
  RedisOptions,
  RmqOptions,
} from '@nestjs/microservices';

/**
 * One option factory per broker transport, shared by the microservice server
 * (`createNestMicroservice` / `connectMicroservice`) and the client (`ClientProxyFactory` /
 * `ClientsModule`) so both ends always agree. Hosts/ports default to the local
 * `docker-compose.yml` services and honour the same `${...}` env overrides the compose file does.
 *
 * Brokers live behind compose profiles: Redis ships on the default profile; RabbitMQ/NATS/MQTT
 * need `--profile brokers`; Kafka needs `--profile kafka`.
 */

const env = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

// #75 Redis (ioredis). Channels are fire-and-forget; request-response rides a reply channel.
export const redisTransport = (): RedisOptions => ({
  transport: Transport.REDIS,
  options: {
    host: env('REDIS_HOST', '127.0.0.1'),
    port: Number(env('REDIS_PORT', '6379')),
  },
});

// #78 RabbitMQ (amqplib + amqp-connection-manager). A per-run queue keeps concurrent boots apart.
// NB: the docs use `queueOptions: { durable: false }`, but RabbitMQ 4 deprecated and *refuses*
// transient non-exclusive queues by default (INTERNAL_ERROR 541), so we declare a durable queue.
export const rmqTransport = (queue: string): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [
      `amqp://${env('RABBITMQ_USER', 'nest')}:${env('RABBITMQ_PASSWORD', 'nest')}@${env('RABBITMQ_HOST', '127.0.0.1')}:${env('RABBITMQ_PORT', '5672')}`,
    ],
    queue,
    // durable (RabbitMQ 4 forbids transient non-exclusive) + autoDelete so the per-run queue is
    // reclaimed when the microservice disconnects (no leaked queues across test runs).
    queueOptions: { durable: true, autoDelete: true },
  },
});

// #77 NATS (nats). Subjects support `*` (one token) / `>` (tail) wildcards.
export const natsTransport = (): NatsOptions => ({
  transport: Transport.NATS,
  options: {
    servers: [
      `nats://${env('NATS_HOST', '127.0.0.1')}:${env('NATS_PORT', '4222')}`,
    ],
  },
});

// #76 MQTT (mqtt). Topics support `+` (one level) / `#` (multi level) wildcards.
export const mqttTransport = (): MqttOptions => ({
  transport: Transport.MQTT,
  options: {
    url: `mqtt://${env('MQTT_HOST', '127.0.0.1')}:${env('MQTT_PORT', '1883')}`,
  },
});

// Kafka broker bootstrap list — shared by the transport options and by the e2e's admin client
// (which pre-creates the request/reply topics to dodge the auto-create-vs-leader-election race).
export const kafkaBrokers = (): string[] => [
  `${env('KAFKA_HOST', '127.0.0.1')}:${env('KAFKA_PORT', '9092')}`,
];

// #79 Kafka (kafkajs). A per-run groupId/clientId avoids cross-run consumer-group state; the
// client must `subscribeToResponseOf(pattern)` before connecting for request-response.
export const kafkaTransport = (
  clientId: string,
  groupId: string,
): KafkaOptions => ({
  transport: Transport.KAFKA,
  options: {
    client: { clientId, brokers: kafkaBrokers() },
    consumer: { groupId },
  },
});
