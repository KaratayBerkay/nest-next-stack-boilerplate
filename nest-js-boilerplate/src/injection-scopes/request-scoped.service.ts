import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';

// REQUEST scope — a new instance is created for each incoming request and GC'd afterward. The
// inherently request-scoped REQUEST provider gives this instance the original request object.
@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {
  readonly instanceId = randomUUID();

  constructor(@Inject(REQUEST) private readonly request: Request) {}

  tenant(): string {
    return (
      (this.request.headers['x-tenant-id'] as string | undefined) ?? 'unknown'
    );
  }
}
