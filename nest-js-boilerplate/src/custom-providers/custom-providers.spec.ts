import { Test } from '@nestjs/testing';
import { CatsService } from './cats.service';
import { ConfigService, DevelopmentConfigService } from './config.service';
import { CustomProvidersModule } from './custom-providers.module';
import { DatabaseConnection } from './database-connection';
import { LoggerService } from './logger.service';
import { ALIASED_LOGGER, CONNECTION } from './tokens';

// Proves each documented custom-provider mechanism resolves as the docs describe.
describe('Custom providers', () => {
  it('useValue: the class token resolves to the constant mock object', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CustomProvidersModule],
    }).compile();

    // Real CatsService.findAll() returns [{name:'real'}]; the mock proves the override took effect.
    expect(moduleRef.get(CatsService).findAll()).toEqual([{ name: 'mock' }]);
  });

  it('useClass: the token resolves to the env-selected concrete class', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CustomProvidersModule],
    }).compile();

    const config = moduleRef.get(ConfigService);
    // Under jest NODE_ENV !== 'production', so the development implementation is wired in.
    expect(config).toBeInstanceOf(DevelopmentConfigService);
    expect(config.get('host')).toBe('dev:host');
  });

  it('useFactory: builds the value from an injected provider; the optional dep is undefined', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CustomProvidersModule],
    }).compile();

    const connection = moduleRef.get<DatabaseConnection>(CONNECTION);
    expect(connection).toBeInstanceOf(DatabaseConnection);
    expect(connection.options).toEqual({
      url: 'postgres://localhost:5433/app',
    });
    expect(connection.optionalFlag).toBeUndefined();
  });

  it('useExisting: the alias and the class token are the same singleton instance', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CustomProvidersModule],
    }).compile();

    const real = moduleRef.get(LoggerService);
    const alias = moduleRef.get<LoggerService>(ALIASED_LOGGER);

    expect(alias).toBe(real); // alias resolves to the very same instance
    alias.log('via-alias');
    expect(real.history()).toEqual(['via-alias']); // state shared through both tokens
  });
});
