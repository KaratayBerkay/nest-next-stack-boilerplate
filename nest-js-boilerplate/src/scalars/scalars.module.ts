import { Module } from '@nestjs/common';
import { ColorScalar } from './color.scalar';
import { SwatchesResolver } from './swatches.resolver';

// Custom & built-in GraphQL scalars. The custom Color scalar is registered simply by
// listing ColorScalar as a provider (the @Scalar decorator does the wiring).
@Module({
  providers: [ColorScalar, SwatchesResolver],
})
export class ScalarsModule {}
