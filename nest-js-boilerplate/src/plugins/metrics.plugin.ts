import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestListener,
} from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { GraphQLMetrics } from './graphql-metrics.service';

// Custom Apollo Server plugin (docs.nestjs.com/graphql/plugins). Marked with @Plugin() and
// registered as a provider, so Nest discovers it and Apollo applies it automatically — and
// because it's a normal provider it can inject GraphQLMetrics via DI.
@Plugin()
export class MetricsPlugin implements ApolloServerPlugin {
  constructor(private readonly metrics: GraphQLMetrics) {}

  // Not `async`: the hooks must return Promises (Apollo's typed contract), and returning
  // them explicitly avoids an async-without-await lint error.
  requestDidStart(): Promise<GraphQLRequestListener<BaseContext>> {
    this.metrics.started();
    const metrics = this.metrics; // capture for the listener closure
    const listener: GraphQLRequestListener<BaseContext> = {
      willSendResponse(requestContext): Promise<void> {
        metrics.completed(requestContext.operationName ?? null);
        return Promise.resolve();
      },
    };
    return Promise.resolve(listener);
  }
}
