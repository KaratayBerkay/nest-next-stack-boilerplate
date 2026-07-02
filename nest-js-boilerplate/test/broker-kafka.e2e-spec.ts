import { INestMicroservice } from '@nestjs/common';
import { ClientKafka, ClientProxyFactory } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { Kafka } from 'kafkajs';
import { firstValueFrom, timeout } from 'rxjs';
import { BrokerTransportsModule } from '../src/broker-transports/broker-transports.module';
import {
  kafkaBrokers,
  kafkaTransport,
} from '../src/broker-transports/transports';

// #79 Kafka transport (kafkajs). Boots the shared handler module as a Kafka microservice and
// drives it with a real ClientKafka over the running broker (`--profile kafka`). Proves the two
// documented patterns: request-response (the client must `subscribeToResponseOf(pattern)` before
// connecting so the `<pattern>.reply` topic is consumed) and event-based delivery (`emit`, no
// reply subscription). The Observable multi-response from #75–78 is intentionally skipped: Kafka
// request-reply is single-response by design. Run via `pnpm test:brokers` (Kafka up).
describe('Microservices / Kafka transport (#79) (e2e)', () => {
  const stamp = Date.now();
  let server: INestMicroservice;
  let client: ClientKafka;

  // Kafka send() waits indefinitely for a reply; cap each attempt and retry so a request produced
  // before the consumer is positioned (consumers start at the latest offset) doesn't hang the
  // suite — a retry re-sends once the group/partitions are stable.
  const sendWithRetry = async <T>(
    pattern: string,
    payload: unknown,
    attempts = 8,
  ): Promise<T> => {
    let lastErr: unknown;
    for (let i = 0; i < attempts; i += 1) {
      try {
        return await firstValueFrom(
          client.send<T>(pattern, payload).pipe(timeout(5_000)),
        );
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr;
  };

  beforeAll(async () => {
    // Pre-create the request + reply topics with elected leaders. Kafka auto-creates topics on
    // first use, but the producer's first send races leader election → "This server does not host
    // this topic-partition"; `waitForLeaders` makes the boot deterministic. Reply topics are the
    // Nest convention `<pattern>.reply`. (Idempotent: a no-op if a prior run left them behind.)
    const admin = new Kafka({
      clientId: `broker-kafka-admin-${stamp}`,
      brokers: kafkaBrokers(),
    }).admin();
    await admin.connect();
    await admin.createTopics({
      waitForLeaders: true,
      topics: [
        'sum',
        'sum.reply',
        'events',
        'events.reply',
        'order.created',
      ].map((topic) => ({ topic, numPartitions: 1 })),
    });
    await admin.disconnect();

    const moduleRef = await Test.createTestingModule({
      imports: [BrokerTransportsModule],
    }).compile();
    server = moduleRef.createNestMicroservice(
      kafkaTransport(`broker-kafka-srv-${stamp}`, `broker-kafka-srv-${stamp}`),
    );
    await server.listen();

    client = ClientProxyFactory.create(
      kafkaTransport(`broker-kafka-cli-${stamp}`, `broker-kafka-cli-${stamp}`),
    ) as ClientKafka;
    client.subscribeToResponseOf('sum');
    client.subscribeToResponseOf('events');
    await client.connect();

    // Warm-up: drive one round-trip until it succeeds, which also confirms the consumer groups
    // are stable and every subscribed topic-partition is assigned before the assertions run.
    await sendWithRetry('sum', [0]);
  }, 120_000);

  afterAll(async () => {
    await client?.close();
    await server?.close();
  }, 30_000);

  it('request-response: @MessagePattern returns the handler result', async () => {
    // Kafka delivers a *primitive* handler return in its string form (`"10"`); objects round-trip
    // as objects — proven by the event test below. The reply still carries the computed value.
    const result = await sendWithRetry<number | string>('sum', [1, 2, 3, 4]);
    expect(Number(result)).toBe(10);
  });

  it('event-based: @EventPattern receives an emitted event (fire-and-forget)', async () => {
    client.emit('order.created', { id: 'o-1', total: 99 });
    let recorded: Array<{ pattern: string; payload: unknown }> = [];
    for (let i = 0; i < 30; i += 1) {
      recorded = await sendWithRetry('events', {});
      if (recorded.some((e) => e.pattern === 'order.created')) break;
      await new Promise((r) => setTimeout(r, 200));
    }
    expect(recorded).toContainEqual({
      pattern: 'order.created',
      payload: { id: 'o-1', total: 99 },
    });
  });
});
