import { Module } from '@nestjs/common';
import { ModuleRefConsumer } from './module-ref-consumer.service';
import { SingletonTool } from './singleton-tool.service';
import { TransientWidget } from './transient-widget.service';

// Standalone demo. Note it does NOT import ExternalModule — that separation is what makes the
// strict-vs-non-strict get() distinction observable.
@Module({
  providers: [SingletonTool, TransientWidget, ModuleRefConsumer],
  exports: [ModuleRefConsumer],
})
export class ModuleReferenceModule {}
