import { Module } from '@nestjs/common';
import { SwcDemoController } from './swc-demo.controller';
import { SwcMathService } from './swc-math.service';

/**
 * #103 SWC. Standalone (not imported by AppModule) — it exists only to prove a
 * Nest module compiles and runs when transpiled by SWC rather than `tsc`. The
 * proof test boots it under `@swc/jest`; the SWC *builder* (`pnpm build:swc`)
 * compiles it as part of the whole `src/` tree.
 */
@Module({
  controllers: [SwcDemoController],
  providers: [SwcMathService],
})
export class SwcDemoModule {}
