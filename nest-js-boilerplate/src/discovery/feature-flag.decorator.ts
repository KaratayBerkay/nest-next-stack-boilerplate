import { DiscoveryService } from '@nestjs/core';

// A custom metadata decorator created via DiscoveryService — tags providers so they can be
// discovered and filtered by their flag value at runtime.
export const FeatureFlag = DiscoveryService.createDecorator<string>();
