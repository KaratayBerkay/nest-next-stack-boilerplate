import { Controller, Get } from '@nestjs/common';

// docs.nestjs.com/techniques/versioning — "Controller versions": a version applied to the
// controller covers all its routes. Two controllers share the `cats` path on different versions.
@Controller({ path: 'cats', version: '1' })
export class CatsV1Controller {
  @Get()
  findAll(): { resource: string; version: string } {
    return { resource: 'cats', version: '1' };
  }
}
