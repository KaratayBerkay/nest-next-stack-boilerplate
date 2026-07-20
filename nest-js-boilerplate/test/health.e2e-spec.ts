/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HealthModule } from '../src/health/health.module';
import { PrismaModule } from '../src/prisma/prisma.module';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        HealthModule,
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health (liveness) reports ok', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect((res.body as { status: string }).status).toBe('ok');
  });

  it('GET /health/ready (readiness) reports the database up', async () => {
    const res = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200);
    const body = res.body as {
      status: string;
      info: Record<string, { status: string }>;
    };
    expect(body.status).toBe('ok');
    expect(body.info.database.status).toBe('up');
  });
});
