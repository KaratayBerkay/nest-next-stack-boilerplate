import { Module } from '@nestjs/common';
import { UsersPluginController } from './users.controller';

/**
 * Swagger CLI plugin demo (docs.nestjs.com/openapi/cli-plugin). The DTO it documents has no
 * `@ApiProperty` decorators; they only exist after the AST transformer runs during compilation.
 *
 * NOTE: like the GraphQL CLI-plugin module, this is intentionally NOT registered in AppModule and is
 * proven by its own Jest config (test/jest-openapi-plugin.json). Under the shared e2e config — which
 * compiles with `isolatedModules` and without the transformer — the DTO would have zero schema
 * properties, so it must stay isolated.
 */
@Module({
  controllers: [UsersPluginController],
})
export class OpenapiPluginModule {}
