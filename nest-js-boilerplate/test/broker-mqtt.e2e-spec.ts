import { INestMicroservice } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { firstValueFrom, lastValueFrom, toArray } from 'rxjs';
import { MqttBrokerModule } from '../src/broker-transports/broker-transports.module';
import { mqttTransport } from '../src/broker-transports/transports';

// #76 MQTT transport (mqtt). Boots the shared handler module (+ the MQTT topic-wildcard
// controller) and drives it with a real ClientProxy over the running broker (Mosquitto,
// `--profile brokers`). Proves request-response (sync + Observable multi-response), event-based
// delivery, and the documented `+` single-level topic wildcard. Run via `pnpm test:brokers`.
describe('Microservices / MQTT transport (#76) (e2e)', () => {
  let server: INestMicroservice;
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MqttBrokerModule],
    }).compile();
    server = moduleRef.createNestMicroservice(mqttTransport());
    await server.listen();

    client = ClientProxyFactory.create(mqttTransport());
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  const send = <T>(pattern: string, payload: unknown): Promise<T> =>
    firstValueFrom(client.send<T>(pattern, payload));

  // Polls the request-response read-back until an event matching `predicate` lands.
  const waitForEvent = async (
    predicate: (e: { pattern: string; payload: unknown }) => boolean,
  ): Promise<Array<{ pattern: string; payload: unknown }>> => {
    let recorded: Array<{ pattern: string; payload: unknown }> = [];
    for (let i = 0; i < 40 && !recorded.some(predicate); i += 1) {
      recorded = await send('events', {});
      if (!recorded.some(predicate))
        await new Promise((r) => setTimeout(r, 50));
    }
    return recorded;
  };

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
    const recorded = await waitForEvent((e) => e.pattern === 'order.created');
    expect(recorded).toContainEqual({
      pattern: 'order.created',
      payload: { id: 'o-1', total: 99 },
    });
  });

  it('topic wildcard: `sensors/+/temperature` receives `sensors/livingroom/temperature`', async () => {
    client.emit('sensors/livingroom/temperature', { celsius: 21 });
    const recorded = await waitForEvent(
      (e) => e.pattern === 'sensors/livingroom/temperature',
    );
    expect(recorded).toContainEqual({
      pattern: 'sensors/livingroom/temperature',
      payload: { celsius: 21 },
    });
  });
});
