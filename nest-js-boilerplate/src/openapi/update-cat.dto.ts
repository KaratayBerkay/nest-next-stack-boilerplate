import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { CreateCatDto } from './create-cat.dto';

/**
 * Mapped types (docs.nestjs.com/openapi/mapped-types). Each helper derives a new schema from
 * `CreateCatDto` so the generated OpenAPI document carries the transformed shape:
 *
 * - `PartialType`        → every property becomes optional (empty `required`).
 * - `PickType`           → keeps only the listed properties.
 * - `OmitType`           → keeps every property except the listed ones.
 * - `IntersectionType`   → merges the properties of two types.
 *
 * Imported from `@nestjs/swagger` (not `@nestjs/mapped-types`) so the OpenAPI metadata is preserved.
 */
export class UpdateCatDto extends PartialType(CreateCatDto) {}

export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}

export class OmitNameCatDto extends OmitType(CreateCatDto, ['name'] as const) {}

/** Extra fields combined into the cat via `IntersectionType`. */
export class CatColorDto {
  @ApiProperty()
  color: string;
}

export class FullCatDto extends IntersectionType(CreateCatDto, CatColorDto) {}
