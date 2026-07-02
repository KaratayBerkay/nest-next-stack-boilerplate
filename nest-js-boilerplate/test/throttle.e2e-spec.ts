import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { HttpThrottlerGuard } from '../src/throttle/http-throttler.guard';
import { ThrottleModule } from '../src/throttle/throttle.module';

describe('Rate limiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 100 }] }),
        ThrottleModule,
      ],
      providers: [{ provide: APP_GUARD, useClass: HttpThrottlerGuard }],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 429 once the per-route limit (3/window) is exceeded', async () => {
    await request(app.getHttpServer()).get('/throttle/limited').expect(200);
    await request(app.getHttpServer()).get('/throttle/limited').expect(200);
    await request(app.getHttpServer()).get('/throttle/limited').expect(200);
    await request(app.getHttpServer()).get('/throttle/limited').expect(429);
  });

  it('never throttles a @SkipThrottle() route', async () => {
    for (let i = 0; i < 6; i++) {
      await request(app.getHttpServer()).get('/throttle/unlimited').expect(200);
    }
  });
});
