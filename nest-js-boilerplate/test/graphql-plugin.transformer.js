// ts-jest astTransformer that applies the @nestjs/graphql CLI plugin during test compilation, so
// the plugin's @Field auto-annotation runs under Jest exactly as it does under `nest build`.
// Scoped to `.gqlmodel.ts` files to mirror nest-cli.json. Requires ts-jest program mode (no
// `isolatedModules`) so `cs.program` — needed by the plugin for type/comment introspection — exists.
const transformer = require('@nestjs/graphql/plugin');

module.exports.name = 'nestjs-graphql-transformer';
module.exports.version = 1;
module.exports.factory = (cs) =>
  transformer.before(
    { typeFileNameSuffix: ['.gqlmodel.ts'], introspectComments: true },
    cs.program,
  );
