import { Controller, Get } from '@nestjs/common';
import { CallProbe } from './call-probe.service';

/**
 * Standalone applications (#86) — a normal HTTP controller, declared only to demonstrate the docs'
 * warning: in a standalone app the controller is still instantiated in the IoC container and can be
 * pulled out with `app.get(ReportController)`, but invoking its method directly bypasses every HTTP
 * enhancer (guards/interceptors/pipes). The `@Get()` route is never mounted — there is no listener.
 */
@Controller('report')
export class ReportController {
  constructor(private readonly probe: CallProbe) {}

  @Get()
  generate(): string {
    this.probe.controllerCalls += 1;
    return 'daily-report';
  }
}
