import { DynamicModule, Module } from '@nestjs/common';
import { GREETER_OPTIONS } from './dynamic-modules.tokens';
import { GreeterService } from './greeter.service';
import type { GreeterOptions } from './dynamic-modules.tokens';

// Manual dynamic module: the static register() returns a DynamicModule (a module created at
// run-time with the same shape as a static one + the required `module` property). It binds the
// caller's options as a provider so GreeterService can inject them.
@Module({})
export class GreeterModule {
  static register(options: GreeterOptions): DynamicModule {
    return {
      module: GreeterModule,
      providers: [
        { provide: GREETER_OPTIONS, useValue: options },
        GreeterService,
      ],
      exports: [GreeterService],
    };
  }
}
