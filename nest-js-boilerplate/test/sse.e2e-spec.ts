import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SseModule } from '../src/sse/sse.module';

// Proves @Sse(): a server-side EventsService.publish() is pushed over a live
// text/event-stream connection to a connected client. Uses Node's global fetch to read
// the stream incrementally (the browser EventSource API isn't available in the test env).
describe('Server-Sent Events (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SseModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.listen(0);
    baseUrl = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  });

  afterAll(async () => {
    await app.close();
  });

  it('opens the stream with a text/event-stream content type', async () => {
    const ac = new AbortController();
    const res = await fetch(`${baseUrl}/sse/stream`, { signal: ac.signal });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');
    ac.abort();
  });

  it('pushes a server-published event to the connected client', async () => {
    const ac = new AbortController();
    const res = await fetch(`${baseUrl}/sse/stream`, { signal: ac.signal });

    const firstDataFrame = (async () => {
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) return null;
        buffer += decoder.decode(value, { stream: true });
        const m = /data: (.+)\n\n/.exec(buffer);
        if (m) return JSON.parse(m[1]) as { message: string };
      }
    })();

    // Let the stream connect, then publish from the server side via REST.
    await new Promise((r) => setTimeout(r, 250));
    const pub = await fetch(`${baseUrl}/sse/publish`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'hello-sse' }),
    });
    expect(pub.status).toBe(201);

    const frame = await firstDataFrame;
    ac.abort();
    expect(frame).toEqual({ message: 'hello-sse' });
  });
});
