import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import type { GrpcOptions } from '@nestjs/microservices';
import { InternalController } from './internal.controller';

/** Absolute path to the internal service contract, resolved from the project root. */
export const INTERNAL_PROTO_PATH = join(process.cwd(), 'proto/internal.proto');

/** Reusable gRPC transport options shared by the server (main.ts) and clients/tests. */
export const internalGrpcOptions = (
  url = process.env.GRPC_URL ?? '0.0.0.0:5050',
): GrpcOptions => ({
  transport: Transport.GRPC,
  options: {
    package: 'internal',
    protoPath: INTERNAL_PROTO_PATH,
    url,
  },
});

@Module({
  controllers: [InternalController],
})
export class GrpcModule {}
