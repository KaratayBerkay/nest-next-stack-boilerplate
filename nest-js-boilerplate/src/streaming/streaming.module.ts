import { Module } from '@nestjs/common';
import { StreamingController } from './streaming.controller';

/**
 * Techniques › Streaming files (#37). Self-contained — `StreamableFile` ships in
 * `@nestjs/common`, so no extra provider or dependency is needed. Standalone
 * (not in AppModule).
 */
@Module({ controllers: [StreamingController] })
export class StreamingModule {}
