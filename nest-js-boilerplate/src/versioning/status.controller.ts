import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';

// docs.nestjs.com/techniques/versioning — VERSION_NEUTRAL: this resource answers regardless of the
// requested version, and also when the request carries no version at all. Under URI versioning it
// has no `v`-prefix in the path.
@Controller({ path: 'status', version: VERSION_NEUTRAL })
export class StatusController {
  @Get()
  check(): { ok: true } {
    return { ok: true };
  }
}
