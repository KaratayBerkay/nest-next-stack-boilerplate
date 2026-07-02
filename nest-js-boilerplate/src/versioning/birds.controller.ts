import { Controller, Get } from '@nestjs/common';

// docs.nestjs.com/techniques/versioning — "Multiple versions": an array binds one handler to
// several versions at once. This single route answers both v1 and v2 requests.
@Controller({ path: 'birds', version: ['1', '2'] })
export class BirdsController {
  @Get()
  findAll(): { resource: string; versions: string[] } {
    return { resource: 'birds', versions: ['1', '2'] };
  }
}
