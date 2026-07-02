import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';

/**
 * OpenAPI / Swagger (docs.nestjs.com/openapi/introduction). The module only declares the REST
 * controllers; the Swagger document itself is assembled at bootstrap with `DocumentBuilder` +
 * `SwaggerModule.createDocument()` / `SwaggerModule.setup()`. The proof in
 * `test/openapi.e2e-spec.ts` performs that bootstrap and asserts both the generated document and
 * the served UI / JSON / YAML endpoints.
 */
@Module({
  controllers: [CatsController],
})
export class OpenapiModule {}
