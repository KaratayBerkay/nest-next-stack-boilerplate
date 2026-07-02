import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

// Schema-directive behaviour (docs.nestjs.com/graphql/directives): wrap the resolver of
// every OBJECT field carrying `@upper` so its string result is upper-cased. Fields without
// the directive are returned untouched, so this is safe to run over the whole app schema.
export function upperDirectiveTransformer(
  schema: GraphQLSchema,
  directiveName: string,
): GraphQLSchema {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const upperDirective = getDirective(
        schema,
        fieldConfig,
        directiveName,
      )?.[0];

      if (upperDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        // Assigning to fieldConfig.resolve contextually types the params (no implicit any).
        fieldConfig.resolve = async (source, args, context, info) => {
          const result = await resolve(source, args, context, info);
          return typeof result === 'string' ? result.toUpperCase() : result;
        };
      }
      return fieldConfig;
    },
  });
}
