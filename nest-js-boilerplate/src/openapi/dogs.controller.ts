import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * A second resource that exists only to prove the "Multiple specifications" feature
 * (docs.nestjs.com/openapi/other-features#multiple-specifications): with both controllers mounted,
 * `createDocument(app, config, { include: [OpenapiModule] })` must yield a document containing the
 * cat paths but NOT this one, and vice-versa.
 */
@ApiTags('dogs')
@Controller('dogs')
export class DogsController {
  @Get()
  @ApiOperation({ summary: 'List dogs' })
  @ApiOkResponse({ description: 'A list of dogs.' })
  findAll(): string[] {
    return ['Rex'];
  }
}
