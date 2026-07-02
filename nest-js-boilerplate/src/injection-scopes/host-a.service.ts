import { Injectable } from '@nestjs/common';
import { TransientService } from './transient.service';

// One consumer of the transient provider. Its injected TransientService is distinct from the one
// HostBService receives — that difference is what proves TRANSIENT scope.
@Injectable()
export class HostAService {
  constructor(private readonly transient: TransientService) {}

  transientId(): string {
    return this.transient.instanceId;
  }
}
