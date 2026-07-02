import { Query, Resolver } from '@nestjs/graphql';
import { GraphQLMetrics } from './graphql-metrics.service';
import { MetricsSnapshot } from './models/metrics-snapshot.model';

@Resolver()
export class MetricsResolver {
  constructor(private readonly metrics: GraphQLMetrics) {}

  // A trivial operation to give the plugin something to observe.
  @Query(() => String, { name: 'ping' })
  ping(): string {
    return 'pong';
  }

  // Surfaces the counters the plugin has been writing, so a test can prove its lifecycle
  // hooks actually ran against real requests.
  @Query(() => MetricsSnapshot, { name: 'metrics' })
  snapshot(): MetricsSnapshot {
    return {
      requestCount: this.metrics.requestCount,
      completedCount: this.metrics.completedCount,
      lastOperationName: this.metrics.lastOperationName,
    };
  }
}
