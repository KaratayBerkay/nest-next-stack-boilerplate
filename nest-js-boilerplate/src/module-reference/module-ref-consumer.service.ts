import { Injectable } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { ExternalService } from './external.service';
import { SingletonTool } from './singleton-tool.service';
import { TransientWidget } from './transient-widget.service';
import { UnregisteredFactory } from './unregistered.factory';

// Exercises every ModuleRef capability the docs describe.
@Injectable()
export class ModuleRefConsumer {
  constructor(private readonly moduleRef: ModuleRef) {}

  // get(): retrieve an instantiated provider from the current module by its token.
  getSingletonName(): string {
    return this.moduleRef.get(SingletonTool).name();
  }

  // get(token, { strict: false }): reach a provider registered in a *different* module.
  getExternalGlobally(): string {
    return this.moduleRef.get(ExternalService, { strict: false }).ping();
  }

  // get() in strict (default) mode refuses providers from other modules — this throws.
  getExternalStrict(): ExternalService {
    return this.moduleRef.get(ExternalService);
  }

  // resolve(): scoped providers come from their own DI sub-tree; two calls → two instances.
  async resolveDistinct(): Promise<[string, string]> {
    const [a, b] = await Promise.all([
      this.moduleRef.resolve(TransientWidget),
      this.moduleRef.resolve(TransientWidget),
    ]);
    return [a.instanceId, b.instanceId];
  }

  // resolve(token, contextId): a shared context id ties calls to one sub-tree → one instance.
  async resolveShared(): Promise<[string, string]> {
    const contextId = ContextIdFactory.create();
    const [a, b] = await Promise.all([
      this.moduleRef.resolve(TransientWidget, contextId),
      this.moduleRef.resolve(TransientWidget, contextId),
    ]);
    return [a.instanceId, b.instanceId];
  }

  // create(): instantiate a class that was never registered as a provider (deps still injected).
  async createUnregistered(): Promise<string> {
    const factory = await this.moduleRef.create(UnregisteredFactory);
    return factory.build();
  }
}
