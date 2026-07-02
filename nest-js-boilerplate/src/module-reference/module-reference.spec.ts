import { Test } from '@nestjs/testing';
import { ExternalModule } from './external.module';
import { ModuleRefConsumer } from './module-ref-consumer.service';
import { ModuleReferenceModule } from './module-reference.module';

// Proves each documented ModuleRef behavior. ExternalModule is imported as a SIBLING (not by
// ModuleReferenceModule) so the strict/non-strict get() distinction is observable.
describe('Module reference (ModuleRef)', () => {
  let consumer: ModuleRefConsumer;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ModuleReferenceModule, ExternalModule],
    }).compile();
    consumer = moduleRef.get(ModuleRefConsumer);
  });

  it('get(): retrieves an instantiated provider from the current module', () => {
    expect(consumer.getSingletonName()).toBe('tool');
  });

  it('get(token, { strict: false }): retrieves a provider from another module', () => {
    expect(consumer.getExternalGlobally()).toBe('external-pong');
  });

  it('get() in strict (default) mode refuses a provider from another module', () => {
    expect(() => consumer.getExternalStrict()).toThrow();
  });

  it('resolve(): two calls return distinct scoped instances', async () => {
    const [a, b] = await consumer.resolveDistinct();
    expect(a).not.toBe(b);
  });

  it('resolve(token, contextId): a shared context id returns the same instance', async () => {
    const [a, b] = await consumer.resolveShared();
    expect(a).toBe(b);
  });

  it('create(): instantiates an unregistered class with its deps injected', async () => {
    expect(await consumer.createUnregistered()).toBe('factory-using-tool');
  });
});
