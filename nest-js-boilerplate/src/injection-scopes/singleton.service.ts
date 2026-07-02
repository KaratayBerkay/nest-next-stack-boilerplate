import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

// DEFAULT scope (singleton) — a single instance shared across the whole app, so instanceId is
// stable no matter how many times it's resolved.
@Injectable()
export class SingletonService {
  readonly instanceId = randomUUID();
}
