import { Injectable } from '@nestjs/common';

// Counter behind a function (not a live-binding export) so the spec can read the current value.
// It proves the provider is NOT constructed at app bootstrap — only when the module is lazily
// loaded on demand.
let instantiations = 0;
export function lazyServiceInstantiations(): number {
  return instantiations;
}

@Injectable()
export class LazyService {
  constructor() {
    instantiations += 1;
  }

  compute(value: number): number {
    return value * 2;
  }
}
