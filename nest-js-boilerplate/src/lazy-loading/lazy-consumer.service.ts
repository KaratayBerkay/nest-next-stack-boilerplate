import { Injectable } from '@nestjs/common';
import { LazyModuleLoader } from '@nestjs/core';

export interface LazyRunResult {
  readonly doubled: number;
  readonly cachedInstance: boolean;
}

// Injects LazyModuleLoader and loads a module on-demand via dynamic import() — the serverless
// "cold start" optimization the docs describe. Crucially, this module never imports LazyModule,
// so LazyService stays uninstantiated until run() is first called.
@Injectable()
export class LazyConsumerService {
  constructor(private readonly lazyModuleLoader: LazyModuleLoader) {}

  async run(value: number): Promise<LazyRunResult> {
    // nodenext requires an explicit extension on dynamic import() of a relative path.
    const { LazyModule } = await import('./lazy.module.js');
    const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);

    const { LazyService } = await import('./lazy.service.js');
    const lazyService = moduleRef.get(LazyService);
    const doubled = lazyService.compute(value);

    // A second load returns the cached module graph, hence the same provider instance.
    const cachedRef = await this.lazyModuleLoader.load(() => LazyModule);
    const cachedService = cachedRef.get(LazyService);

    return { doubled, cachedInstance: lazyService === cachedService };
  }
}
