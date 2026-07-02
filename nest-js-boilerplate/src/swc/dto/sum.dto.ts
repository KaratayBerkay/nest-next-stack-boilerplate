import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';

/**
 * The `ValidationPipe` learns which class to validate a `@Body()` against from
 * the parameter's `design:type` metadata. Under SWC that metadata only exists
 * if `decoratorMetadata: true` is set in `.swcrc` — so a rejected invalid body
 * is itself proof the metadata survived compilation.
 */
export class SumDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  numbers!: number[];
}
