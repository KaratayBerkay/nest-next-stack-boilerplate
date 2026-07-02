import { INestMicroservice } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { firstValueFrom, lastValueFrom, toArray } from 'rxjs';
import { BrokerTransportsModule } from '../src/broker-transports/broker-transports.module';
import { redisTransport } from '../src/broker-transports/transports';

// #75 Redis transport (ioredis). Boots the shared handler module as a Redis microservice and
// drives it with a real ClientProxy over the running broker (default docker profile). Proves the
// documented Overview behaviour over Redis: request-response (sync + Observable multi-response)
// and event-based delivery (read back over request-response). Run via `pnpm test:brokers`.
describe('Microservices / Redis transport (#75) (e2e)', () => {
  let server: INestMicroservice;
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [BrokerTransportsModule],
    }).compile();
    server = moduleRef.createNestMicroservice(redisTransport());
    await server.listen();

    client = ClientProxyFactory.create(redisTransport());
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
    // emit() is fire-and-forget; poll the request-response read-back until the event lands.
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
