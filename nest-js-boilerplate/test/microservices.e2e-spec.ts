import { INestMicroservice } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { firstValueFrom, lastValueFrom, toArray } from 'rxjs';
import {
  MicroservicesModule,
  tcpOptions,
} from '../src/microservices/microservices.module';

// Proves the microservices section end-to-end over the built-in TCP transport (no broker):
// the Overview (#74 — @MessagePattern request-response incl. Observable multi-response, and
// @EventPattern event-based) plus every enhancer — exception filters (#82, RpcException),
// pipes (#83), guards (#84) and interceptors (#85) — driven by a real ClientProxy over the
// wire. Errors are asserted on the client's send() error channel (the documented RPC shape).
describe('Microservices / TCP transport + enhancers (e2e)', () => {
  // Random high port so concurrent local runs don't collide.
  const port = 8800 + Math.floor(Math.random() * 400);
  let server: INestMicroservice;
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MicroservicesModule],
    }).compile();
    server = moduleRef.createNestMicroservice(tcpOptions(port));
    await server.listen();

    client = ClientProxyFactory.create(tcpOptions(port));
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  // Resolves with the value, or rejects with the RPC error object the client receives.
  const send = <T>(cmd: string, payload: unknown): Promise<T> =>
    firstValueFrom(client.send<T>({ cmd }, payload));

  describe('#74 Overview', () => {
    it('request-response: @MessagePattern returns the handler result', async () => {
      await expect(send<number>('sum', [1, 2, 3, 4])).resolves.toBe(10);
    });

    it('request-response: an Observable handler emits each value as a response', async () => {
      const values = await lastValueFrom(
        client.send<number>({ cmd: 'stream' }, [5, 6, 7]).pipe(toArray()),
      );
      expect(values).toEqual([5, 6, 7]);
    });

    it('event-based: @EventPattern receives an emitted event (fire-and-forget)', async () => {
      client.emit('order.created', { id: 'o-1', total: 99 });
      // emit() is hot/fire-and-forget; poll the request-response read-back until it lands.
      let recorded: Array<{ pattern: string; payload: unknown }> = [];
      for (let i = 0; i < 20 && recorded.length === 0; i += 1) {
        recorded = await send<Array<{ pattern: string; payload: unknown }>>(
          'events',
          {},
        );
        if (recorded.length === 0) await new Promise((r) => setTimeout(r, 25));
      }
      expect(recorded).toContainEqual({
        pattern: 'order.created',
        payload: { id: 'o-1', total: 99 },
      });
    });
  });

  describe('#82 Exception filters', () => {
    it('default filter: RpcException(string) → { status: "error", message }', async () => {
      await expect(send('throw-rpc', {})).rejects.toEqual({
        status: 'error',
        message: 'Invalid credentials.',
      });
    });

    it('custom @Catch(RpcException) filter reshapes the error', async () => {
      await expect(send('throw-custom', {})).rejects.toEqual({
        code: 'RPC_HANDLED',
        detail: 'boom',
      });
    });

    it('inheritance: a plain Error → BaseRpcExceptionFilter unknown-error shape', async () => {
      await expect(send('throw-unknown', {})).rejects.toEqual({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });

  describe('#83 Pipes', () => {
    it('valid payload flows through the ValidationPipe to the handler', async () => {
      await expect(
        send('create-order', { product: 'widget', quantity: 3 }),
      ).resolves.toEqual({ created: { product: 'widget', quantity: 3 } });
    });

    it('invalid payload → RpcException carrying the ValidationError array', async () => {
      const error = await send('create-order', {
        product: '',
        quantity: 0,
      }).catch((e: unknown) => e);
      const properties = (error as Array<{ property: string }>).map(
        (e) => e.property,
      );
      expect(properties).toEqual(
        expect.arrayContaining(['product', 'quantity']),
      );
    });
  });

  describe('#84 Guards', () => {
    it('a valid token admits the call', async () => {
      await expect(send('secure', { token: 'valid-token' })).resolves.toEqual({
        secured: true,
      });
    });

    it('no token → RpcException("Forbidden resource")', async () => {
      await expect(send('secure', {})).rejects.toEqual({
        status: 'error',
        message: 'Forbidden resource',
      });
    });
  });

  describe('#85 Interceptors', () => {
    it('wraps the handler result in the { data } envelope', async () => {
      await expect(send('transform', { value: 42 })).resolves.toEqual({
        data: { value: 42 },
      });
    });
  });
});
