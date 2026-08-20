import { BadRequestException } from '@nestjs/common';
import { MapperKind, mapSchema } from '@graphql-tools/utils';
import {
  defaultFieldResolver,
  GraphQLSchema,
  type GraphQLResolveInfo,
} from 'graphql';
import { deepDecryptIds, encryptFieldIfId } from './id-codec.util';

// Same mapSchema idiom as upper-directive.transformer.ts, applied schema-wide
// instead of behind an opt-in directive: wraps every OBJECT field's resolver
// so that (a) any known-uuid-named argument anywhere in its args tree is
// decrypted before the real resolver runs, and (b) the field's own result is
// encrypted afterward if the field itself is a known uuid field of its
// parent type. No resolver or `src/@generated/**` file needs touching —
// `@generated` is fully regenerated (and any hand edit wiped) on every
// `prisma generate`, so that was never an option anyway.
//
// The output side is deliberately shallow (see encryptFieldIfId) — GraphQL's
// own execution engine already recurses into nested relations field-by-field,
// each with its own wrapped resolver call, so a deep walk here would
// double-encrypt. The input side has no such recursion to lean on (a client
// sends `args` as one nested blob in a single call), so decryption there is
// a genuine deep walk.
export function idCodecSchemaTransformer(schema: GraphQLSchema): GraphQLSchema {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig, fieldName, typeName) => {
      const { resolve = defaultFieldResolver } = fieldConfig;
      fieldConfig.resolve = async (
        source: unknown,
        args: Record<string, unknown>,
        context: unknown,
        info: GraphQLResolveInfo,
      ) => {
        let decryptedArgs: Record<string, unknown> = args;
        if (args && Object.keys(args).length > 0) {
          try {
            decryptedArgs = deepDecryptIds(args) as Record<string, unknown>;
          } catch {
            throw new BadRequestException('Invalid id');
          }
        }
        const result = await resolve(source, decryptedArgs, context, info);
        return encryptFieldIfId(typeName, fieldName, result);
      };
      return fieldConfig;
    },
  });
}
