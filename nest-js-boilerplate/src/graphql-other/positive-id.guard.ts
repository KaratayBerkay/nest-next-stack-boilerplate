import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

// A guard that works in the GraphQL context by reading resolver ARGS via GqlExecutionContext
// (docs.nestjs.com/graphql/other-features — the getArgs() path). Rejects a non-positive id.
@Injectable()
export class PositiveIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { id } = GqlExecutionContext.create(context).getArgs<{
      id?: number;
    }>();
    return typeof id !== 'number' || id > 0;
  }
}
