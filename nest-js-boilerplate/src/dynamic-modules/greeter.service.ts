import { Inject, Injectable } from '@nestjs/common';
import { GREETER_OPTIONS } from './dynamic-modules.tokens';
import type { GreeterOptions } from './dynamic-modules.tokens';

// Consumes the options object that register() bound to the IoC container — proving the consuming
// module influenced how this provider was configured.
@Injectable()
export class GreeterService {
  constructor(
    @Inject(GREETER_OPTIONS) private readonly options: GreeterOptions,
  ) {}

  greet(name: string): string {
    return `${this.options.greeting}, ${name}!`;
  }
}
