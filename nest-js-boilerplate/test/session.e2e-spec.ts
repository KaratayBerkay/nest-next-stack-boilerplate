import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SessionModule } from '../src/session/session.module';

// Proves express-session persistence over HTTP using cookie-carrying agents:
// per-client session state, isolation between clients, and login/logout/destroy.
describe('Session (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SessionModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('@Session() persists data across requests for the same client', async () => {
    const agent = request.agent(app.getHttpServer());
    expect((await agent.get('/session/visits').expect(200)).body).toEqual({
      visits: 1,
    });
    expect((await agent.get('/session/visits').expect(200)).body).toEqual({
      visits: 2,
    });
    expect((await agent.get('/session/visits').expect(200)).body).toEqual({
      visits: 3,
    });
  });

  it('@Req() req.session works the same way', async () => {
    const agent = request.agent(app.getHttpServer());
    expect((await agent.get('/session/visits-req').expect(200)).body).toEqual({
      visits: 1,
    });
    expect((await agent.get('/session/visits-req').expect(200)).body).toEqual({
      visits: 2,
    });
  });

  it('separate clients get isolated sessions', async () => {
    const a = request.agent(app.getHttpServer());
    const b = request.agent(app.getHttpServer());
    await a.get('/session/visits').expect(200);
    await a.get('/session/visits').expect(200); // a -> 2
    expect((await b.get('/session/visits').expect(200)).body).toEqual({
      visits: 1, // b starts fresh
    });
  });

  it('login stores the user, me reads it, logout destroys the session', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.post('/session/login').send({ user: 'ada' }).expect(201);
    expect((await agent.get('/session/me').expect(200)).body).toEqual({
      user: 'ada',
    });
    await agent.post('/session/logout').expect(201);
    expect((await agent.get('/session/me').expect(200)).body).toEqual({
      user: null,
    });
  });
});
