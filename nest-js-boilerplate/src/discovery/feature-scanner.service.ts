import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { FeatureFlag } from './feature-flag.decorator';

// Uses DiscoveryService to introspect the running app: list providers/controllers and filter
// providers by the metadata a custom decorator attached.
@Injectable()
export class FeatureScannerService {
  constructor(private readonly discoveryService: DiscoveryService) {}

  // Names of every provider tagged with the given feature flag.
  providersWithFlag(flag: string): string[] {
    return this.discoveryService
      .getProviders()
      .filter(
        (wrapper) =>
          this.discoveryService.getMetadataByDecorator(FeatureFlag, wrapper) ===
          flag,
      )
      .map((wrapper) => String(wrapper.name));
  }

  controllerNames(): string[] {
    return this.discoveryService
      .getControllers()
      .map((wrapper) => String(wrapper.name));
  }
}
