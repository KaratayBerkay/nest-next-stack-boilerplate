import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { EventsModule } from '../src/events/events.module';

// Proves the documented Events behaviors over HTTP: emit() -> @OnEvent dispatch,
// a wildcard listener (wildcard:true), and emitAsync() aggregating listener results.
describe('Events (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [EventsModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await request(app.getHttpServer()).delete('/events/log').expect(200);
  });

  it('emit() dispatches to the exact-name @OnEvent listener', async () => {
    const created = await request(app.getHttpServer())
      .post('/events/orders')
      .send({ item: 'book' })
      .expect(201);
    const createdBody = created.body as { orderId: number; item: string };

    const log = await request(app.getHttpServer())
      .get('/events/log')
      .expect(200);
    const entries = log.body as Array<{
      channel: string;
      orderId: number;
      item: string;
    }>;
    expect(entries).toContainEqual({
      channel: 'order.created',
      orderId: createdBody.orderId,
      item: 'book',
    });
  });

  it('a wildcard @OnEvent("order.*") also receives the same order.created emit', async () => {
    await request(app.getHttpServer())
      .post('/events/orders')
      .send({ item: 'pen' })
      .expect(201);

    const log = await request(app.getHttpServer())
      .get('/events/log')
      .expect(200);
    const channels = (log.body as Array<{ channel: string }>).map(
      (e) => e.channel,
    );
    expect(channels).toContain('order.created'); // exact listener
    expect(channels).toContain('order.*'); // wildcard listener, same emit
  });

  it('emitAsync() aggregates every matching listener return value', async () => {
    const res = await request(app.getHttpServer())
      .post('/events/inventory')
      .send({ sku: 'SKU-1' })
      .expect(201);
    const body = res.body as {
      responses: Array<{ warehouse: string; reserved: number }>;
    };

    expect(body.responses.map((r) => r.warehouse).sort()).toEqual(['A', 'B']);
    expect(body.responses.reduce((sum, r) => sum + r.reserved, 0)).toBe(8);
  });
});
