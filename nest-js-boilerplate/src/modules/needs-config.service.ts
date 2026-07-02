import { Inject, Injectable } from '@nestjs/common';
import { APP_INFO } from './modules.tokens';
import type { AppInfo } from './modules.tokens';

// Injects the global APP_INFO token even though NeedsConfigModule never imports GlobalConfigModule
// — proving the @Global() registration makes the provider ubiquitously available.
@Injectable()
export class NeedsConfigService {
  constructor(@Inject(APP_INFO) private readonly info: AppInfo) {}

  appName(): string {
    return this.info.name;
  }
}
