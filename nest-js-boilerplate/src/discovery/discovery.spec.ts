import { Test } from '@nestjs/testing';
import { DiscoveryDemoModule } from './discovery.module';
import { FeatureScannerService } from './feature-scanner.service';

// Proves DiscoveryService can introspect providers/controllers and filter by decorator metadata.
describe('Discovery service', () => {
  let scanner: FeatureScannerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DiscoveryDemoModule],
    }).compile();
    await moduleRef.init();
    scanner = moduleRef.get(FeatureScannerService);
  });

  it('filters providers by metadata from a DiscoveryService.createDecorator() decorator', () => {
    expect(scanner.providersWithFlag('experimental')).toEqual([
      'ExperimentalService',
    ]);
    expect(scanner.providersWithFlag('stable')).toEqual(['StableService']);
  });

  it('does not match providers that lack the decorator', () => {
    expect(scanner.providersWithFlag('experimental')).not.toContain(
      'PlainService',
    );
  });

  it('getControllers() discovers registered controllers', () => {
    expect(scanner.controllerNames()).toContain('DiscoveryDemoController');
  });
});
