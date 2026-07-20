/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication, INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { GreetingLogicService } from '../src/platform-agnosticism/greeting-logic.service';
import { PlatformAgnosticModule } from '../src/platform-agnosticism/platform-agnostic.module';

// Proves the doc's thesis: the same platform-agnostic provider is reused, unchanged, across two
// different APPLICATION TYPES — a full HTTP server and a standalone (no-HTTP) application context.
describe('Platform agnosticism (e2e)', () => {
  let httpApp: INestApplication;
  let standalone: INestApplicationContext;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PlatformAgnosticModule],
    }).compile();
    httpApp = moduleRef.createNestApplication();
    await httpApp.init();

    // Same module, but as a standalone Node.js app context — no HTTP listener at all.
    standalone = await NestFactory.createApplicationContext(
      PlatformAgnosticModule,
      { logger: false },
    );
  });

  afterAll(async () => {
    await httpApp.close();
    await standalone.close();
  });

  it('the same provider yields identical output over HTTP and in a standalone context', async () => {
    const res = await request(httpApp.getHttpServer())
      .get('/agnostic/greet/Ada')
      .expect(200);
    const httpMessage = (res.body as { message: string }).message;

    const fromContext = standalone.get(GreetingLogicService).greet('Ada');

    expect(httpMessage).toBe('Hello, Ada!');
    expect(fromContext).toBe('Hello, Ada!');
    expect(httpMessage).toBe(fromContext); // build once, use everywhere
  });
});
