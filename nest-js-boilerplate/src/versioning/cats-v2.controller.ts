import { Controller, Get } from '@nestjs/common';

// docs.nestjs.com/techniques/versioning — the v2 counterpart of the same `cats` resource.
@Controller({ path: 'cats', version: '2' })
export class CatsV2Controller {
  @Get()
  findAll(): { resource: string; version: string } {
    return { resource: 'cats', version: '2' };
  }
}
