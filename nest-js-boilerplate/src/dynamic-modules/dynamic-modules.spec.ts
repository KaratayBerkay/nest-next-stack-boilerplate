import { Test } from '@nestjs/testing';
import { GreeterModule } from './greeter.module';
import { GreeterService } from './greeter.service';
import { StorageModule } from './storage.module';
import { StorageService } from './storage.service';

// Proves both documented dynamic-module styles: the manual register() and the
// ConfigurableModuleBuilder-generated forRoot/forRootAsync.
describe('Dynamic modules', () => {
  describe('manual register() pattern', () => {
    it('register(options) configures the exported service from the passed options', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [GreeterModule.register({ greeting: 'Hello' })],
      }).compile();

      expect(moduleRef.get(GreeterService).greet('Ada')).toBe('Hello, Ada!');
    });

    it('a different register() call yields a differently-configured module', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [GreeterModule.register({ greeting: 'Hola' })],
      }).compile();

      // Same module class, different options → different behavior. This is the whole point of
      // dynamic modules vs. static binding.
      expect(moduleRef.get(GreeterService).greet('Ada')).toBe('Hola, Ada!');
    });
  });

  describe('ConfigurableModuleBuilder (forRoot / forRootAsync)', () => {
    it('forRoot(options) injects MODULE_OPTIONS_TOKEN into the service', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [StorageModule.forRoot({ bucket: 'media' })],
      }).compile();

      expect(moduleRef.get(StorageService).location('a.png')).toBe(
        'media/a.png',
      );
    });

    it('forRootAsync({ useFactory }) resolves the options object via DI', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          StorageModule.forRootAsync({
            // Returns a Promise (no `async` needed) — proves Nest awaits the async options factory.
            useFactory: () => Promise.resolve({ bucket: 'async-bucket' }),
          }),
        ],
      }).compile();

      expect(moduleRef.get(StorageService).location('b.png')).toBe(
        'async-bucket/b.png',
      );
    });
  });
});
