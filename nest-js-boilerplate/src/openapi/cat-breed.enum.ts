/**
 * A real TypeScript enum used across the OpenAPI DTOs. Passing `enum: CatBreed` together with
 * `enumName: 'CatBreed'` to `@ApiProperty` makes `@nestjs/swagger` hoist it into a reusable
 * `#/components/schemas/CatBreed` schema instead of inlining the values on every property
 * (docs.nestjs.com/openapi/types-and-parameters#enums-schema).
 */
export enum CatBreed {
  Persian = 'Persian',
  Tabby = 'Tabby',
  Siamese = 'Siamese',
}
