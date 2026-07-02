import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { io, Socket } from 'socket.io-client';
import { WsModule } from '../src/ws/ws.module';

// Proves @WebSocketGateway end-to-end against a real socket.io client: single-response
// ack (return value), the @Ack() callback, WsResponse event + broadcast to other clients,
// the connection lifecycle hook (presence broadcast), and Observable multi-responses.
describe('WebSocket gateway (e2e)', () => {
  let app: INestApplication;
  let url: string;
  const clients: Socket[] = [];

  const connect = (): Promise<Socket> =>
    new Promise((resolve, reject) => {
      const socket = io(url, { transports: ['websocket'], forceNew: true });
      clients.push(socket);
      socket.on('connect', () => resolve(socket));
      socket.on('connect_error', reject);
    });

  const once = <T>(socket: Socket, event: string): Promise<T> =>
    new Promise((resolve) => socket.once(event, (data: T) => resolve(data)));

  const waitForPresence = (
    socket: Socket,
    min: number,
  ): Promise<{ online: number }> =>
    new Promise((resolve) => {
      const handler = (p: { online: number }) => {
        if (p.online >= min) {
          socket.off('presence', handler);
          resolve(p);
        }
      };
      socket.on('presence', handler);
    });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [WsModule],
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

  it('acks a single-response handler (return value -> client ack)', async () => {
    const client = await connect();
    const reply = (await client.emitWithAck('echo', { ping: 1 })) as {
      ping: number;
    };
    expect(reply).toEqual({ ping: 1 });
  });

  it('resolves an explicit @Ack() callback', async () => {
    const client = await connect();
    const reply = (await client.emitWithAck('ping')) as { pong: boolean };
    expect(reply).toEqual({ pong: true });
  });

  it('returns a WsResponse to the sender and broadcasts to other clients', async () => {
    const sender = await connect();
    const other = await connect();

    const senderGot = once<{ text: string; from: string }>(sender, 'message');
    const otherGot = once<{ text: string; from: string }>(other, 'message');
    sender.emit('message', { text: 'hi' });

    const [a, b] = await Promise.all([senderGot, otherGot]);
    expect(a.text).toBe('hi');
    expect(b.text).toBe('hi');
    expect(a.from).toBe(sender.id);
    expect(b.from).toBe(sender.id);
  });

  it('broadcasts presence from the connection lifecycle hook', async () => {
    const watcher = await connect();
    const presence = waitForPresence(watcher, 2);
    await connect(); // triggers handleConnection -> server.emit('presence')
    const payload = await presence;
    expect(payload.online).toBeGreaterThanOrEqual(2);
  });

  it('streams multiple responses from an Observable handler', async () => {
    const client = await connect();
    const numbers: number[] = [];
    const done = new Promise<void>((resolve) => {
      client.on('countdown', (n: number) => {
        numbers.push(n);
        if (numbers.length === 3) resolve();
      });
    });
    client.emit('countdown');
    await done;
    expect(numbers).toEqual([3, 2, 1]);
  });
});
