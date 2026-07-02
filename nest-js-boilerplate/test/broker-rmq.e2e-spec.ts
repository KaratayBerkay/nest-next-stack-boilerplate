import { INestMicroservice } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { firstValueFrom, lastValueFrom, toArray } from 'rxjs';
import { BrokerTransportsModule } from '../src/broker-transports/broker-transports.module';
import { rmqTransport } from '../src/broker-transports/transports';

// #78 RabbitMQ transport (amqplib + amqp-connection-manager). Boots the shared handler module as
// an RMQ microservice and drives it with a real ClientProxy over the running broker
// (`--profile brokers`). Proves request-response (sync + Observable multi-response) and
// event-based delivery. Run via `pnpm test:brokers`.
describe('Microservices / RabbitMQ (RMQ) transport (#78) (e2e)', () => {
  // Per-run queue so leftover messages / concurrent runs don't collide.
  const queue = `broker_rmq_${Date.now()}`;
  let server: INestMicroservice;
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [BrokerTransportsModule],
    }).compile();
    server = moduleRef.createNestMicroservice(rmqTransport(queue));
    await server.listen();

    client = ClientProxyFactory.create(rmqTransport(queue));
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  const send = <T>(pattern: string, payload: unknown): Promise<T> =>
    firstValueFrom(client.send<T>(pattern, payload));

  it('request-response: @MessagePattern returns the handler result', async () => {
    await expect(send<number>('sum', [1, 2, 3, 4])).resolves.toBe(10);
  });

  it('request-response: an Observable handler emits each value as a response', async () => {
    const values = await lastValueFrom(
      client.send<number>('stream', [5, 6, 7]).pipe(toArray()),
    );
    expect(values).toEqual([5, 6, 7]);
  });

  it('event-based: @EventPattern receives an emitted event (fire-and-forget)', async () => {
    client.emit('order.created', { id: 'o-1', total: 99 });
    let recorded: Array<{ pattern: string; payload: unknown }> = [];
    for (let i = 0; i < 40 && recorded.length === 0; i += 1) {
      recorded = await send('events', {});
      if (recorded.length === 0) await new Promise((r) => setTimeout(r, 50));
    }
    expect(recorded).toContainEqual({
      pattern: 'order.created',
      payload: { id: 'o-1', total: 99 },
    });
  });
});
