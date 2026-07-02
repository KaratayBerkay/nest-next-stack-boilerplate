import { Controller, Get, Version } from '@nestjs/common';

// docs.nestjs.com/techniques/versioning — "Route versions": the @Version() decorator versions an
// individual handler (and overrides any controller-level version). Same path, two handlers, picked
// by the request's version.
@Controller('dogs')
export class DogsController {
  @Version('1')
  @Get()
  findAllV1(): { resource: string; version: string } {
    return { resource: 'dogs', version: '1' };
  }

  @Version('2')
  @Get()
  findAllV2(): { resource: string; version: string } {
    return { resource: 'dogs', version: '2' };
  }
}
