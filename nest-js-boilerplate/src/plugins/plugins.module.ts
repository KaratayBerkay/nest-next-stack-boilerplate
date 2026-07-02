import { Module } from '@nestjs/common';
import { GraphQLMetrics } from './graphql-metrics.service';
import { MetricsPlugin } from './metrics.plugin';
import { MetricsResolver } from './metrics.resolver';

// Apollo Server plugins. Listing MetricsPlugin as a provider is all that's needed — the
// @Plugin() decorator + Nest's provider discovery wire it into Apollo's request lifecycle.
@Module({
  providers: [GraphQLMetrics, MetricsPlugin, MetricsResolver],
})
export class PluginsModule {}
