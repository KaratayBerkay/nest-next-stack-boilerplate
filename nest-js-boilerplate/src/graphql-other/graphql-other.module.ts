import { Module } from '@nestjs/common';
import { ReportsResolver } from './reports.resolver';
import { TraceService } from './trace.service';

// "Other features" (docs.nestjs.com/graphql/other-features): guards, interceptors and custom param
// decorators in the GraphQL context (via GqlExecutionContext), plus field-resolver enhancers. The
// `fieldResolverEnhancers: ['interceptors']` flag is set once on the root GraphQLModule.
@Module({
  providers: [ReportsResolver, TraceService],
})
export class GraphqlOtherModule {}
