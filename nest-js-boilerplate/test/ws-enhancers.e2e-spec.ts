import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { io, Socket } from 'socket.io-client';
import { WsEnhancersModule } from '../src/ws-enhancers/ws-enhancers.module';

// Proves every WebSocket enhancer (#69–72) against a real socket.io client: a thrown
// WsException surfacing as an 'exception' event (default + custom @Catch filters +
// BaseWsExceptionFilter for unknown errors), a ValidationPipe gating the `data` param,
// a guard authorizing from the handshake token, and an interceptor reshaping the reply.
describe('WebSocket enhancers (e2e)', () => {
  let app: INestApplication;
  let url: string;
  const clients: Socket[] = [];

  const connect = (auth?: Record<string, unknown>): Promise<Socket> =>
    new Promise((resolve, reject) => {
      const socket = io(url, {
        transports: ['websocket'],
        forceNew: true,
        auth,
      });
      clients.push(socket);
      socket.on('connect', () => resolve(socket));
      socket.on('connect_error', reject);
    });

  const once = <T>(socket: Socket, event: string): Promise<T> =>
    new Promise((resolve) => socket.once(event, (data: T) => resolve(data)));

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [WsEnhancersModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.listen(0);
    url = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  });

  afterEach(() => {
    while (clients.length) clients.pop()?.disconnect();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('exception filters (#69)', () => {
    it('default filter emits an "exception" event for a thrown WsException', async () => {
      const client = await connect();
      const err = once<{
        status: string;
        message: string;
        cause?: { pattern: string };
      }>(client, 'exception');
      client.emit('throw-default', { any: 'payload' });
      const payload = await err;
      expect(payload.status).toBe('error');
      expect(payload.message).toBe('Invalid credentials.');
      // BaseWsExceptionFilter's default cause factory records the source pattern.
      expect(payload.cause?.pattern).toBe('throw-default');
    });

    it('custom @Catch(WsException) filter reshapes the error onto a custom event', async () => {
      const client = await connect();
      const err = once<{ code: string; detail: string }>(
        client,
        'custom-error',
      );
      client.emit('throw-custom');
      expect(await err).toEqual({ code: 'WS_HANDLED', detail: 'boom' });
    });

    it('@Catch() extending BaseWsExceptionFilter handles a non-Ws Error (default shape)', async () => {
      const client = await connect();
      const err = once<{ status: string; message: string }>(
        client,
        'exception',
      );
      client.emit('throw-unknown');
      const payload = await err;
      expect(payload.status).toBe('error');
      expect(payload.message).toBe('Internal server error');
    });
  });

  describe('pipes (#70)', () => {
    it('passes valid data through the ValidationPipe to the handler', async () => {
      const client = await connect();
      const created = once<{ text: string; priority: number }>(
        client,
        'created',
      );
      client.emit('create', { text: 'hello', priority: 5 });
      expect(await created).toEqual({ text: 'hello', priority: 5 });
    });

    it('rejects invalid data via the WsException exceptionFactory -> "exception" event', async () => {
      const client = await connect();
      const err = once<Array<{ property: string }>>(client, 'exception');
      client.emit('create', { text: '', priority: 0 });
      const props = (await err).map((e) => e.property);
      expect(props).toContain('text');
      expect(props).toContain('priority');
    });
  });

  describe('guards (#71)', () => {
    it('allows a client whose handshake carries a valid token', async () => {
      const client = await connect({ token: 'valid-token' });
      const secured = once<{ ok: boolean }>(client, 'secured');
      client.emit('secure');
      expect(await secured).toEqual({ ok: true });
    });

    it('denies a client without a valid token ("Forbidden resource")', async () => {
      const client = await connect(); // no handshake token
      const err = once<{ status: string; message: string }>(
        client,
        'exception',
      );
      client.emit('secure');
      const payload = await err;
      expect(payload.status).toBe('error');
      expect(payload.message).toBe('Forbidden resource');
    });
  });

  describe('interceptors (#72)', () => {
    it('wraps the handler result in a { data } envelope', async () => {
      const client = await connect();
      const reply = (await client.emitWithAck('transform', { n: 7 })) as {
        data: { value: { n: number } };
      };
      expect(reply).toEqual({ data: { value: { n: 7 } } });
    });
  });
});
