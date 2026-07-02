import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Observable } from 'rxjs';
import { TraceService } from './trace.service';

// Helper from docs.nestjs.com/graphql/other-features: true when an enhancer is firing for a
// @ResolveField (i.e. the parent type is not the root Query/Mutation).
export function isResolvingGraphQLField(context: ExecutionContext): boolean {
  if (context.getType<GqlContextType>() === 'graphql') {
    const info =
      GqlExecutionContext.create(context).getInfo<GraphQLResolveInfo>();
    const parentType = info.parentType.name;
    return parentType !== 'Query' && parentType !== 'Mutation';
  }
  return false;
}

// A NestInterceptor that runs in the GraphQL context. It records the resolved field's parent type
// and name so a test can prove the interceptor fired — including on @ResolveField methods once
// `fieldResolverEnhancers: ['interceptors']` is enabled on the root GraphQLModule.
@Injectable()
export class FieldTraceInterceptor implements NestInterceptor {
  constructor(private readonly traces: TraceService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType<GqlContextType>() === 'graphql') {
      const info =
        GqlExecutionContext.create(context).getInfo<GraphQLResolveInfo>();
      this.traces.record({
        parentType: info.parentType.name,
        field: info.fieldName,
        atFieldLevel: isResolvingGraphQLField(context),
      });
    }
    return next.handle();
  }
}
