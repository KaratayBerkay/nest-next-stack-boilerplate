import { Module } from '@nestjs/common';
import { createConnection } from './async-connection';
import { ConnectionConsumerService } from './connection-consumer.service';
import { ASYNC_CONNECTION } from './tokens';

// Standalone demo: the async `useFactory` returns a Promise; Nest awaits it before instantiating
// ConnectionConsumerService, which injects the resolved value.
@Module({
  providers: [
    {
      provide: ASYNC_CONNECTION,
      useFactory: async () => createConnection(),
    },
    ConnectionConsumerService,
  ],
  exports: [ASYNC_CONNECTION, ConnectionConsumerService],
})
export class AsyncProvidersModule {}
