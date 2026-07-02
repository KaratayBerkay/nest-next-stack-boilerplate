import { Injectable } from '@nestjs/common';
import { TransientService } from './transient.service';

// A second, independent consumer of the transient provider (see HostAService).
@Injectable()
export class HostBService {
  constructor(private readonly transient: TransientService) {}

  transientId(): string {
    return this.transient.instanceId;
  }
}
