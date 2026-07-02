import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestListener,
} from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';

const MAX_COMPLEXITY = 200;

// Apollo plugin (docs.nestjs.com/graphql/complexity) that rejects queries whose computed
// cost exceeds a budget, before they execute. GraphQLSchemaHost gives access to the built
// schema needed by getComplexity.
@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  constructor(private readonly gqlSchemaHost: GraphQLSchemaHost) {}

  // Not `async`: the hooks must return Promises, and returning them explicitly avoids an
  // async-without-await lint error.
  requestDidStart(): Promise<GraphQLRequestListener<BaseContext>> {
    const { schema } = this.gqlSchemaHost;
    const listener: GraphQLRequestListener<BaseContext> = {
      didResolveOperation: ({ request, document }): Promise<void> => {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });
        if (complexity > MAX_COMPLEXITY) {
          return Promise.reject(
            new GraphQLError(
              `Query is too complex: ${complexity}. Maximum allowed complexity: ${MAX_COMPLEXITY}`,
            ),
          );
        }
        return Promise.resolve();
      },
    };
    return Promise.resolve(listener);
  }
}
