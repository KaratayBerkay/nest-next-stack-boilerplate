import { Module } from '@nestjs/common';
import { CatsReportService } from './cats-report.service';
import { CatsService } from './cats.service';
import { PropertyInjectionService } from './property-injection.service';

// Standalone DI demo — not in AppModule (DI is already used by every service in the app; this
// module exists to prove the documented wiring in isolation). GREETING is intentionally NOT
// provided so the @Optional fallback in CatsReportService is exercised by the spec.
@Module({
  providers: [CatsService, CatsReportService, PropertyInjectionService],
  exports: [CatsService, CatsReportService, PropertyInjectionService],
})
export class ProvidersModule {}
