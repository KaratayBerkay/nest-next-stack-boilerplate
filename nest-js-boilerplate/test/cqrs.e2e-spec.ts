/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CqrsExampleModule } from '../src/cqrs/cqrs.module';

// Proves the CQRS recipe (#113) end-to-end over HTTP, driving only the two buses from the
// controller. A single kill exercises the full chain: CommandBus → command handler →
// AggregateRoot.apply/commit → EventBus → @EventsHandler (recorded) AND @Saga() → a follow-up
// DropAncientItemCommand → second handler → a second aggregate event. The QueryBus read model
// then reflects the event-sourced state. The saga leg is asynchronous, so the read model is
// polled until the dropped item lands.
describe('CQRS / Heroes (e2e)', () => {
  let app: INestApplication;
  let actionId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsExampleModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/cqrs/heroes/1/kill')
      .send({ dragonId: 'd-1' })
      .expect(201);
    actionId = (res.body as { actionId: string }).actionId;

    // The saga reacts asynchronously (event → DropAncientItemCommand); poll the read model
    // until the dropped item appears, so downstream assertions don't race the saga.
    for (let i = 0; i < 40; i += 1) {
      const hero = await request(app.getHttpServer()).get('/cqrs/heroes/1');
      const items = (hero.body as { items?: string[] }).items;
      if ((items?.length ?? 0) > 0) break;
      await new Promise((r) => setTimeout(r, 25));
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('CommandBus: the handler returns its typed { actionId } result', () => {
    expect(typeof actionId).toBe('string');
    expect(actionId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('EventBus + @EventsHandler: the kill event was delivered to its handler', async () => {
    const res = await request(app.getHttpServer())
      .get('/cqrs/events')
      .expect(200);
    expect(res.body).toContainEqual({
      type: 'HeroKilledDragonEvent',
      payload: { heroId: '1', dragonId: 'd-1' },
    });
  });

  it('QueryBus + AggregateRoot: the read model reflects the event-sourced kill', async () => {
    const res = await request(app.getHttpServer())
      .get('/cqrs/heroes/1')
      .expect(200);
    expect((res.body as { kills: string[] }).kills).toEqual(['d-1']);
  });

  it('@Saga(): the kill auto-dispatched a DropAncientItemCommand (event → command → event)', async () => {
    const hero = await request(app.getHttpServer())
      .get('/cqrs/heroes/1')
      .expect(200);
    expect((hero.body as { items: string[] }).items).toEqual(['ancient-d-1']);

    const events = await request(app.getHttpServer())
      .get('/cqrs/events')
      .expect(200);
    expect(events.body).toContainEqual({
      type: 'AncientItemDroppedEvent',
      payload: { heroId: '1', itemId: 'ancient-d-1' },
    });
  });
});
