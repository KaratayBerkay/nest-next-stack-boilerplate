import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CatBreed } from './cat-breed.enum';

/**
 * Request DTO that exercises the documented `@ApiProperty` surface
 * (docs.nestjs.com/openapi/types-and-parameters): a plain property, Schema Object options
 * (description / minimum / default / example), an explicit array type, a named enum, and the
 * `@ApiPropertyOptional` short-hand that drops the field from the schema's `required` list.
 */
export class CreateCatDto {
  @ApiProperty({ example: 'Maru' })
  name: string;

  @ApiProperty({
    description: 'The age of a cat',
    minimum: 1,
    default: 1,
    example: 3,
  })
  age: number;

  // `enumName` turns the inline enum into a reusable `CatBreed` schema referenced via `$ref`.
  @ApiProperty({ enum: CatBreed, enumName: 'CatBreed' })
  breed: CatBreed;

  // Arrays must be declared explicitly — reflection cannot recover the element type.
  @ApiProperty({ type: [String], description: 'Alternative names' })
  nicknames: string[];

  // Optional → emitted with `required: false`, i.e. absent from the schema's `required` array.
  @ApiPropertyOptional({ description: 'Optional microchip identifier' })
  microchipId?: string;
}
