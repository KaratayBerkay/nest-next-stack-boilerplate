import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { FieldNode, GraphQLResolveInfo, Kind } from 'graphql';

// Custom param decorator that works in the GraphQL context (docs.nestjs.com/graphql/other-features):
// it injects the names of the sub-fields the client selected on the current field, read from the
// GraphQL `info` via GqlExecutionContext.
export const Selection = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string[] => {
    const info = GqlExecutionContext.create(ctx).getInfo<GraphQLResolveInfo>();
    const selections = info.fieldNodes[0]?.selectionSet?.selections ?? [];
    return selections
      .filter((node): node is FieldNode => node.kind === Kind.FIELD)
      .map((node) => node.name.value);
  },
);
