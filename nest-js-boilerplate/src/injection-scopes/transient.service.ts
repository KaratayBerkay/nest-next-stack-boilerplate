import { Injectable, Scope } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

// TRANSIENT scope — not shared: every consumer that injects it receives a fresh, dedicated
// instance (and each moduleRef.resolve() call yields a new one too).
@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {
  readonly instanceId = randomUUID();
}
