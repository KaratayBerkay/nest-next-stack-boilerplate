import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { AuditLogProcessor } from './audit-log.processor';
import { ElasticsearchModule } from './elasticsearch.module';
import { FrontendEventConsumer } from './frontend-event.consumer';
import { OUTBOX_QUEUE } from './outbox.constants';
import { OutboxService } from './outbox.service';

// Global so any feature can inject OutboxService to emit domain events without re-importing.
@Global()
@Module({
  imports: [
    BullModule.registerQueue({ name: OUTBOX_QUEUE }),
    ElasticsearchModule,
  ],
  providers: [OutboxService, AuditLogProcessor, FrontendEventConsumer],
  exports: [OutboxService],
})
export class OutboxModule {}
