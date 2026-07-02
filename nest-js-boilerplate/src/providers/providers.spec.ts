import { Test } from '@nestjs/testing';
import { CatsReportService } from './cats-report.service';
import { CatsService } from './cats.service';
import { PropertyInjectionService } from './property-injection.service';
import { ProvidersModule } from './providers.module';
import { GREETING } from './providers.tokens';

// Proves DI actually wires the providers together (not just that they compile).
describe('Providers (DI)', () => {
  it('resolves constructor DI and the @Optional default when the token is unbound', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ProvidersModule],
    }).compile();

    const cats = moduleRef.get(CatsService);
    const report = moduleRef.get(CatsReportService);
    cats.create({ name: 'Felix', age: 3, breed: 'Tabby' });
    cats.create({ name: 'Tom', age: 5, breed: 'Siamese' });

    expect(report.summary()).toBe('Hello: 2 cats'); // @Optional fell back to its default
  });

  it('honors a bound token (useValue) over the @Optional default', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CatsService,
        CatsReportService,
        { provide: GREETING, useValue: 'Hola' },
      ],
    }).compile();

    expect(moduleRef.get(CatsReportService).summary()).toBe('Hola: 0 cats');
  });

  it('supports property-based injection via @Inject()', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ProvidersModule],
    }).compile();

    const cats = moduleRef.get(CatsService);
    const propSvc = moduleRef.get(PropertyInjectionService);
    cats.create({ name: 'Whiskers', age: 1, breed: 'Persian' });

    expect(propSvc.count()).toBe(1); // shares the singleton CatsService
  });
});
