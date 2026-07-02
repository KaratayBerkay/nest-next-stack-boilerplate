import { Test } from '@nestjs/testing';
import { HostAService } from './host-a.service';
import { HostBService } from './host-b.service';
import { InjectionScopesModule } from './injection-scopes.module';
import { SingletonService } from './singleton.service';
import { TransientService } from './transient.service';

// Proves the DEFAULT and TRANSIENT scope semantics from the docs. REQUEST scope (which needs a
// live request payload) is proven over HTTP in test/injection-scopes.e2e-spec.ts.
describe('Injection scopes', () => {
  it('DEFAULT: the same singleton instance is shared across resolutions', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [InjectionScopesModule],
    }).compile();

    expect(moduleRef.get(SingletonService)).toBe(
      moduleRef.get(SingletonService),
    );
  });

  it('TRANSIENT: two different consumers each receive their own instance', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [InjectionScopesModule],
    }).compile();

    const a = moduleRef.get(HostAService).transientId();
    const b = moduleRef.get(HostBService).transientId();
    expect(a).not.toBe(b);
  });

  it('TRANSIENT: resolve() hands out a fresh instance on each call', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [InjectionScopesModule],
    }).compile();

    const first = await moduleRef.resolve(TransientService);
    const second = await moduleRef.resolve(TransientService);
    expect(first.instanceId).not.toBe(second.instanceId);
  });
});
