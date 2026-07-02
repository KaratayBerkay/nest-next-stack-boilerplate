import { IntrospectAndCompose } from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { DynamicModule, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

export interface SubgraphRef {
  name: string;
  url: string;
}

// The Apollo gateway composes the subgraphs' schemas into one supergraph and plans/routes queries
// across them (docs.nestjs.com/graphql/federation). Subgraph URLs are injected so a test can point
// it at ephemeral ports — `IntrospectAndCompose` fetches each subgraph's SDL at startup.
@Module({})
export class GatewayModule {
  static forSubgraphs(subgraphs: SubgraphRef[]): DynamicModule {
    return {
      module: GatewayModule,
      imports: [
        GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
          driver: ApolloGatewayDriver,
          gateway: {
            supergraphSdl: new IntrospectAndCompose({ subgraphs }),
          },
        }),
      ],
    };
  }
}
