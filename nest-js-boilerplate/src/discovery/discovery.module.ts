import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { DiscoveryDemoController } from './discovery-demo.controller';
import { ExperimentalService } from './experimental.service';
import { FeatureScannerService } from './feature-scanner.service';
import { PlainService } from './plain.service';
import { StableService } from './stable.service';

// DiscoveryModule must be imported for DiscoveryService to be injectable. Standalone demo.
@Module({
  imports: [DiscoveryModule],
  controllers: [DiscoveryDemoController],
  providers: [
    ExperimentalService,
    StableService,
    PlainService,
    FeatureScannerService,
  ],
})
export class DiscoveryDemoModule {}
