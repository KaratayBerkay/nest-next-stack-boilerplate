import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './storage.module-definition';
import { StorageService } from './storage.service';

// Extending ConfigurableModuleClass gives StorageModule both forRoot(options) and the async
// forRootAsync({ useFactory, inject }) variants for free.
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule extends ConfigurableModuleClass {}
