import { INestMicroservice } from '@nestjs/common';
import { ClientGrpc, ClientProxyFactory } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { Observable, firstValueFrom, lastValueFrom, toArray } from 'rxjs';
import { GrpcModule, internalGrpcOptions } from '../src/grpc/grpc.module';

// Proves the gRPC transport end-to-end for internal service-to-service comms: a real gRPC
// microservice (GrpcModule) is booted and called over the wire by a gRPC client — unary
// (Ping/Sum) and server-streaming (Countdown, an Observable streamed to the caller).
interface InternalService {
  Ping(req: {
    message: string;
  }): Observable<{ message: string; timestamp: number }>;
  Sum(req: { numbers: number[] }): Observable<{ total: number }>;
  Countdown(req: { from: number }): Observable<{ value: number }>;
}

describe('gRPC microservice (e2e)', () => {
  // Random high port so concurrent local runs don't collide.
  const url = `127.0.0.1:${50500 + Math.floor(Math.random() * 400)}`;
  let server: INestMicroservice;
  let client: ClientGrpc & { close?: () => void };
  let svc: InternalService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GrpcModule],
    }).compile();
    server = moduleRef.createNestMicroservice(internalGrpcOptions(url));
    await server.listen();

    client = ClientProxyFactory.create(
      internalGrpcOptions(url),
    ) as unknown as ClientGrpc & { close?: () => void };
    svc = client.getService<InternalService>('Internal');
  });

  afterAll(async () => {
    client.close?.();
    await server.close();
  });

  it('unary: Ping echoes the message with a server timestamp', async () => {
    const res = await firstValueFrom(svc.Ping({ message: 'hello-grpc' }));
    expect(res.message).toBe('hello-grpc');
    expect(typeof res.timestamp).toBe('number');
  });

  it('unary: Sum adds the numbers', async () => {
    const res = await firstValueFrom(svc.Sum({ numbers: [1, 2, 3, 4] }));
    expect(res.total).toBe(10);
  });

  it('server-streaming: Countdown streams 3, 2, 1', async () => {
    const values = await lastValueFrom(
      svc.Countdown({ from: 3 }).pipe(toArray()),
    );
    expect(values.map((v) => v.value)).toEqual([3, 2, 1]);
  });
});
