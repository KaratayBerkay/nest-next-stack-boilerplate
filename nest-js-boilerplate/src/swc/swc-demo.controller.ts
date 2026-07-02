import { Body, Controller, Get, Post } from '@nestjs/common';
import { SumDto } from './dto/sum.dto';
import { SwcMathService } from './swc-math.service';

/**
 * Self-contained surface that exercises the two things SWC must get right for a
 * Nest app to run: constructor DI by type and `@Body()` param-type inference —
 * both depend on reflected decorator metadata that SWC only emits with
 * `decoratorMetadata: true`. Compiled by `@swc/jest` in `test/swc.e2e-spec.ts`.
 */
@Controller('swc')
export class SwcDemoController {
  // No `@Inject()` token — resolution is purely by the reflected parameter type.
  constructor(private readonly math: SwcMathService) {}

  @Get('ping')
  ping(): { swc: true; sum: number } {
    // Calls the injected provider so a correct sum proves DI-by-type wired it.
    return { swc: true, sum: this.math.sum([1, 2, 3]) };
  }

  @Post('sum')
  sum(@Body() dto: SumDto): { total: number } {
    return { total: this.math.sum(dto.numbers) };
  }
}
