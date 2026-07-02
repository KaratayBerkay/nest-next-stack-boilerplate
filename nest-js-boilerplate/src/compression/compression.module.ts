import { Module } from '@nestjs/common';
import { CompressionController } from './compression.controller';

// The compression middleware is registered globally in main.ts (applying it both globally and
// per-route would double-compress the body). See test/compression.e2e-spec.ts for the proof.
@Module({ controllers: [CompressionController] })
export class CompressionModule {}
