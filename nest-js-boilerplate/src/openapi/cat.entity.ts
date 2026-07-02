import { ApiProperty } from '@nestjs/swagger';
import { CatBreed } from './cat-breed.enum';

/**
 * Response model. Referenced through the `type` option of the response decorators
 * (`@ApiCreatedResponse({ type: Cat })`), which both documents the payload shape and registers
 * `Cat` in `components.schemas` (docs.nestjs.com/openapi/operations#responses).
 */
export class Cat {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty({ enum: CatBreed, enumName: 'CatBreed' })
  breed: CatBreed;
}
