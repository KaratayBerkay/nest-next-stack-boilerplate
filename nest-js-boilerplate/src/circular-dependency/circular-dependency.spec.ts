import { Test } from '@nestjs/testing';
import { CatsModule } from './cats.module';
import { CatsService } from './cats.service';
import { CommonModule } from './common.module';
import { CommonService } from './common.service';

// Proves forwardRef() resolves a circular dependency both between providers and between modules:
// if it didn't, compile() would throw a resolution error instead of returning a wired graph.
describe('Circular dependency (forwardRef)', () => {
  it('resolves the cycle and lets CatsService reach CommonService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CatsModule],
    }).compile();

    expect(moduleRef.get(CatsService).viaCommon()).toBe('common knows cat');
  });

  it('resolves the cycle from the other module too', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CommonModule],
    }).compile();

    expect(moduleRef.get(CommonService).describe()).toBe('common knows cat');
  });
});
