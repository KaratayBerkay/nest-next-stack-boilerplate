import { INestApplication } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { Test } from '@nestjs/testing';
import { WebSocket } from 'ws';
import { WsAdapterModule } from '../src/ws-adapter/ws-adapter.module';

// Proves the platform-agnostic gateway runs on the `ws`-library `WsAdapter`
// (@nestjs/platform-ws) — the documented alternative to socket.io — with a real `ws`
// client over the wire. Two apps: one on the default WsAdapter (JSON { event, data }
// protocol) and one with a custom messageParser (a [event, data] tuple protocol),
// proving both the adapter swap and the configurable message format.
describe('WebSocket adapter / ws library (e2e)', () => {
  let defaultApp: INestApplication;
  let parserApp: INestApplication;
  let defaultUrl: string;
  let parserUrl: string;
  const sockets: WebSocket[] = [];

  const toWsUrl = (httpUrl: string): string =>
    httpUrl.replace('[::1]', '127.0.0.1').replace(/^http/, 'ws');

  const boot = async (
    adapterFactory: (app: INestApplication) => WsAdapter,
  ): Promise<{ app: INestApplication; url: string }> => {
    const moduleRef = await Test.createTestingModule({
      imports: [WsAdapterModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    app.useWebSocketAdapter(adapterFactory(app));
    await app.listen(0);
    return { app, url: toWsUrl(await app.getUrl()) };
  };

  const connect = (url: string): Promise<WebSocket> =>
    new Promise((resolve, reject) => {
      const socket = new WebSocket(url);
      sockets.push(socket);
      socket.on('open', () => resolve(socket));
      socket.on('error', reject);
    });

  const rpc = (
    socket: WebSocket,
    payload: unknown,
  ): Promise<{ event: string; data: unknown }> =>
    new Promise((resolve, reject) => {
      socket.once('message', (raw: Buffer) =>
        resolve(JSON.parse(raw.toString()) as { event: string; data: unknown }),
      );
      socket.once('error', reject);
      socket.send(JSON.stringify(payload));
    });

  beforeAll(async () => {
    ({ app: defaultApp, url: defaultUrl } = await boot(
      (app) => new WsAdapter(app),
    ));
    ({ app: parserApp, url: parserUrl } = await boot(
      (app) =>
        new WsAdapter(app, {
          // Custom wire format: messages arrive as a [event, data] tuple.
          messageParser: (data) => {
            const text =
              typeof data === 'string' ? data : (data as Buffer).toString();
            const [event, payload] = JSON.parse(text) as [string, unknown];
            return { event, data: payload };
          },
        }),
    ));
  });

  afterEach(() => {
    while (sockets.length) sockets.pop()?.close();
  });

  afterAll(async () => {
    await defaultApp.close();
    await parserApp.close();
  });

  describe('default WsAdapter ({ event, data } JSON protocol)', () => {
    it('echoes a message back through the ws adapter', async () => {
      const socket = await connect(defaultUrl);
      const reply = await rpc(socket, { event: 'echo', data: { hi: 1 } });
      expect(reply).toEqual({ event: 'echo', data: { hi: 1 } });
    });

    it('routes to the @SubscribeMessage handler and returns its WsResponse', async () => {
      const socket = await connect(defaultUrl);
      const reply = await rpc(socket, { event: 'sum', data: { a: 2, b: 5 } });
      expect(reply).toEqual({ event: 'sum', data: 7 });
    });
  });

  describe('custom messageParser ([event, data] tuple protocol)', () => {
    it('dispatches messages parsed from a custom wire format', async () => {
      const socket = await connect(parserUrl);
      const reply = await rpc(socket, ['sum', { a: 10, b: 11 }]);
      expect(reply).toEqual({ event: 'sum', data: 21 });
    });
  });
});
