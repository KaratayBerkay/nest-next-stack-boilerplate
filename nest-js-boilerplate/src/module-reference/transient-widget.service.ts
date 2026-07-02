import { Injectable, Scope } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

// A scoped (transient) provider — can't be fetched with get(); must be obtained with resolve().
@Injectable({ scope: Scope.TRANSIENT })
export class TransientWidget {
  readonly instanceId = randomUUID();
}
