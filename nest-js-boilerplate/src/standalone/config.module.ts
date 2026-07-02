import { DynamicModule, Module } from '@nestjs/common';
import { CONFIG_OPTIONS, ConfigOptions, ConfigService } from './config.service';

/**
 * Standalone applications (#86) — a minimal dynamic module mirroring the docs' canonical
 * `ConfigModule.register({ folder: './config' })`. Its return value is captured into the
 * `dynamicConfigModule` constant in `standalone.module.ts` so the *exact same object* can later be
 * handed to `app.select(...)`.
 */
@Module({})
export class ConfigModule {
  static register(options: ConfigOptions): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        { provide: CONFIG_OPTIONS, useValue: options },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}
