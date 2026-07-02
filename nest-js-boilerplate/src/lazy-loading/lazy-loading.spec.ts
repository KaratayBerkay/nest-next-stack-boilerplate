import { Test } from '@nestjs/testing';
import { LazyConsumerService } from './lazy-consumer.service';
import { LazyLoadingModule } from './lazy-loading.module';
import { lazyServiceInstantiations } from './lazy.service';

// Proves LazyModuleLoader loads a module on-demand (not at bootstrap) and caches it.
describe('Lazy loading modules', () => {
  it('does not instantiate the lazy provider until load() is called, then caches it', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [LazyLoadingModule],
    }).compile();
    await moduleRef.init();

    // Nothing in the lazy module is instantiated at bootstrap — the whole point of lazy loading.
    expect(lazyServiceInstantiations()).toBe(0);

    const consumer = moduleRef.get(LazyConsumerService);
    const result = await consumer.run(21);

    // The provider was loaded on demand and its logic ran...
    expect(result.doubled).toBe(42);
    // ...it only came into existence at load() time...
    expect(lazyServiceInstantiations()).toBeGreaterThan(0);
    // ...and a second load() returned the cached module graph (the very same instance).
    expect(result.cachedInstance).toBe(true);
  });
});
