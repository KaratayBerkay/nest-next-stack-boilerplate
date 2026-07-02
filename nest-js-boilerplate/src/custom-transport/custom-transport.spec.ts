import type { INestMicroservice } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { CustomTransportModule } from './custom-transport.module';
import { EventStore } from './event-store.service';
import { InMemoryBroker } from './in-memory-broker';
import { InMemoryClient } from './in-memory.client';
import { InMemoryServer } from './in-memory.server';

// Proves custom transporters (#81). We boot a real microservice the documented way —
// `NestFactory.createMicroservice(AppModule, { strategy })` — with our in-memory `Server` strategy,
// then talk to it through our in-memory `ClientProxy`. This exercises the genuine
// `@nestjs/microservices` machinery: Nest scans `@MessagePattern`/`@EventPattern` and registers
// them into our strategy, and `client.send()/emit()` flow through `publish()`/`dispatchEvent()`
// back to those handlers — a stronger proof than the docs' `console.log` walkthrough.
describe('custom transporter (#81)', () => {
  let app: INestMicroservice;
  let broker: InMemoryBroker;
  let server: InMemoryServer;
  let client: InMemoryClient;

  beforeEach(async () => {
    broker = new InMemoryBroker();
    server = new InMemoryServer(broker);
    app = await NestFactory.createMicroservice(CustomTransportModule, {
      strategy: server,
      logger: false,
    });
    await app.listen();
    client = new InMemoryClient(broker);
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers every @MessagePattern/@EventPattern into the strategy at bootstrap', () => {
    expect(broker.isBound).toBe(true);
    expect(server.registeredPatterns).toEqual(
      expect.arrayContaining(['echo', 'sum', 'slow', 'user.created']),
    );
  });

  it('round-trips a request/response (send → publish → broker → handler → send → observer)', async () => {
    const response = await firstValueFrom(
      client.send<{ hello: string }>('echo', { hello: 'world' }),
    );

    expect(response).toEqual({ hello: 'world' });
  });

  it('executes real handler logic over the custom transport (sum)', async () => {
    const total = await firstValueFrom(
      client.send<number>('sum', { values: [2, 3, 4] }),
    );

    expect(total).toBe(9);
  });

  it('routes events via emit → dispatchEvent → handleEvent (no response channel)', async () => {
    const store = app.get(EventStore);

    client.emit('user.created', { id: 1, name: 'Ada' });
    // `emit` connects eagerly and dispatches asynchronously; flush the microtask queue.
    await new Promise((resolve) => setImmediate(resolve));

    expect(store.all).toContainEqual({
      pattern: 'user.created',
      data: { id: 1, name: 'Ada' },
    });
  });

  it('errors on the response channel when no handler matches the pattern', async () => {
    await expect(
      firstValueFrom(client.send('does-not-exist', { x: 1 })),
    ).rejects.toMatch(/no matching message handler/i);
  });

  it('runs the publish() teardown when a subscription ends early (timeout before response)', async () => {
    await expect(
      firstValueFrom(client.send('slow', { x: 1 }).pipe(timeout(50))),
    ).rejects.toThrow();

    expect(client.teardownLog).toContain('slow');
  });
});
