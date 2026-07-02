import { ApiProperty } from '@nestjs/swagger';

/**
 * Envelope for the generic `ApiResponse` pattern
 * (docs.nestjs.com/openapi/operations#advanced-generic-apiresponse). `results` is intentionally
 * left undecorated: the controller supplies its element type at the route level via a raw
 * `allOf` + `getSchemaPath(Cat)` definition. The DTO is surfaced with `@ApiExtraModels` because
 * nothing references it directly as a body/response type.
 */
export class PaginatedCatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  offset: number;
}
