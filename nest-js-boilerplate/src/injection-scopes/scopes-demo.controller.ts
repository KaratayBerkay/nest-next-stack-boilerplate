import { Controller, Get } from '@nestjs/common';
import { RequestScopedService } from './request-scoped.service';

// Because this controller depends on a REQUEST-scoped provider, the REQUEST scope "bubbles up" the
// injection chain and the controller itself becomes request-scoped — a new instance per request.
@Controller('scopes')
export class ScopesDemoController {
  constructor(private readonly requestScoped: RequestScopedService) {}

  @Get('request')
  request(): { instanceId: string; tenant: string } {
    return {
      instanceId: this.requestScoped.instanceId,
      tenant: this.requestScoped.tenant(),
    };
  }
}
