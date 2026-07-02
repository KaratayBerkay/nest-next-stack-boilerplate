import { Module } from '@nestjs/common';
import { CatsService } from './cats.service';
import {
  ConfigService,
  DevelopmentConfigService,
  ProductionConfigService,
} from './config.service';
import { DatabaseConnection } from './database-connection';
import { LoggerService } from './logger.service';
import { OptionsProvider } from './options.provider';
import { ALIASED_LOGGER, CONNECTION, OPTIONAL_FLAG } from './tokens';

// A structurally-compatible mock that satisfies the CatsService interface (TS structural typing) —
// `useValue` swaps the real class for this object.
const mockCatsService: Pick<CatsService, 'findAll'> = {
  findAll: () => [{ name: 'mock' }],
};

// Standalone DI demo (not in AppModule) proving all four custom-provider mechanisms in isolation.
@Module({
  providers: [
    // 1) useValue — the CatsService class token resolves to a constant mock object.
    { provide: CatsService, useValue: mockCatsService },

    // 2) useClass — choose the concrete ConfigService implementation at registration time.
    {
      provide: ConfigService,
      useClass:
        process.env.NODE_ENV === 'production'
          ? ProductionConfigService
          : DevelopmentConfigService,
    },

    // 3) useFactory — build a value dynamically from an injected provider (mandatory) plus an
    //    optional token that resolves to `undefined` because it's never registered.
    OptionsProvider,
    {
      provide: CONNECTION,
      useFactory: (
        options: OptionsProvider,
        flag?: string,
      ): DatabaseConnection => new DatabaseConnection(options.get(), flag),
      inject: [OptionsProvider, { token: OPTIONAL_FLAG, optional: true }],
    },

    // 4) useExisting — ALIASED_LOGGER is an alias for the singleton LoggerService (same instance).
    LoggerService,
    { provide: ALIASED_LOGGER, useExisting: LoggerService },
  ],
  exports: [
    CatsService,
    ConfigService,
    CONNECTION,
    LoggerService,
    ALIASED_LOGGER,
  ],
})
export class CustomProvidersModule {}
