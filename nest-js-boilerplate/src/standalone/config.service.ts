import { Inject, Injectable } from '@nestjs/common';

export const CONFIG_OPTIONS = Symbol('STANDALONE_CONFIG_OPTIONS');

export interface ConfigOptions {
  folder: string;
}

/**
 * Standalone applications (#86) — the provider produced by the DYNAMIC `ConfigModule.register()`.
 * The proof test reaches it via
 * `app.select(dynamicConfigModule).get(ConfigService, { strict: true })`, showing that selecting a
 * dynamic module requires the very same module *reference* that was imported (see the docs'
 * "Retrieving providers from dynamic modules" section).
 */
@Injectable()
export class ConfigService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: ConfigOptions,
  ) {}

  getFolder(): string {
    return this.options.folder;
  }
}
