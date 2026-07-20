/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ExecutionContextModule } from '../src/execution-context/execution-context.module';
import type { ContextProbe } from '../src/execution-context/context-probe.interceptor';

// Proves the ExecutionContext/ArgumentsHost + Reflector surface from the docs, observed from
// inside a real interceptor over HTTP.
describe('Execution context (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ExecutionContextModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('exposes context + reflector metadata for a method with class/method overrides', async () => {
    const res = await request(app.getHttpServer())
      .post('/ctx/create')
      .send({ name: 'Felix' })
      .expect(201);

    const body = res.body as {
      data: { created: string };
      probe: ContextProbe;
    };
    expect(body.data).toEqual({ created: 'Felix' });

    const p = body.probe;
    // ArgumentsHost / ExecutionContext:
    expect(p.type).toBe('http');
    expect(p.className).toBe('ExecutionContextController');
    expect(p.handlerName).toBe('create');
    expect(p.method).toBe('POST');
    expect(p.path).toBe('/ctx/create');
    expect(p.argByIndexIsRequest).toBe(true);
    // Reflector#get on the handler returns the method-level metadata:
    expect(p.rolesFromHandler).toEqual(['admin']);
    // getAllAndOverride: method overrides class default:
    expect(p.rolesOverride).toEqual(['admin']);
    // getAllAndMerge: class + method combined:
    expect(p.rolesMerge).toEqual(expect.arrayContaining(['user', 'admin']));
    expect(p.rolesMerge).toHaveLength(2);
    // Low-level @SetMetadata read by string key:
    expect(p.permissions).toEqual(['write']);
  });

  it('getAllAndOverride falls back to class metadata when the method has none', async () => {
    const res = await request(app.getHttpServer()).get('/ctx/list').expect(200);

    const body = res.body as {
      data: { items: string[] };
      probe: ContextProbe;
    };
    expect(body.data).toEqual({ items: ['a', 'b'] });
    expect(body.probe.handlerName).toBe('list');
    expect(body.probe.rolesFromHandler).toBeUndefined(); // no method-level @Roles
    expect(body.probe.rolesOverride).toEqual(['user']); // inherited from the controller
  });
});
