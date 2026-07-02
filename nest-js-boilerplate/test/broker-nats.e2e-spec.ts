import { INestMicroservice } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { firstValueFrom, lastValueFrom, toArray } from 'rxjs';
import { NatsBrokerModule } from '../src/broker-transports/broker-transports.module';
import { natsTransport } from '../src/broker-transports/transports';

// #77 NATS transport (nats). Boots the shared handler module (+ the NATS subject-wildcard
// controller) and drives it with a real ClientProxy over the running broker
// (`--profile brokers`). Proves request-response (sync + Observable multi-response), event-based
// delivery, and the documented subject wildcard (`time.*`). Run via `pnpm test:brokers`.
describe('Microservices / NATS transport (#77) (e2e)', () => {
  let server: INestMicroservice;
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [NatsBrokerModule],
    }).compile();
    server = moduleRef.createNestMicroservice(natsTransport());
    await server.listen();

    client = ClientProxyFactory.create(natsTransport());
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

  it('subject wildcard: `time.*` answers a request sent to `time.us`', async () => {
    // The server subscribed to `time.*`; NATS routes `time.us` to it. The handler reads back the
    // concrete subject via @Ctx() NatsContext.
    await expect(send<{ subject: string }>('time.us', {})).resolves.toEqual({
      subject: 'time.us',
    });
  });
});
