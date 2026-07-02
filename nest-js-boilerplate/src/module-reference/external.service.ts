import { Injectable } from '@nestjs/common';

// Lives in a *different* module (ExternalModule) — reachable only via get(token, { strict: false }).
@Injectable()
export class ExternalService {
  ping(): string {
    return 'external-pong';
  }
}
