// ts-jest astTransformer that applies the @nestjs/swagger CLI plugin during test compilation, so the
// plugin's @ApiProperty auto-annotation runs under Jest exactly as it does under `nest build`.
// Mirrors docs.nestjs.com/openapi/cli-plugin#integration-with-ts-jest-e2e-tests. Requires ts-jest
// program mode (no `isolatedModules`) so `cs.program` — needed by the plugin to read TS types and
// JSDoc comments — exists. Files are matched by the default suffixes ['.dto.ts', '.entity.ts'].
const transformer = require('@nestjs/swagger/plugin');

module.exports.name = 'nestjs-swagger-transformer';
// Bump this version whenever the options below change, or Jest will reuse a stale transform cache.
module.exports.version = 1;
module.exports.factory = (cs) =>
  transformer.before(
    { classValidatorShim: true, introspectComments: true },
    cs.program,
  );
