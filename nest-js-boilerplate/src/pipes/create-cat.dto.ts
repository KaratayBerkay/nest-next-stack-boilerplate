import { IsInt, IsString, Min, MinLength } from 'class-validator';

// A plain DTO carrying class-validator decorators. The custom CustomValidationPipe reads this class
// as the param's `metatype`, rebuilds an instance with plainToInstance and runs these validators.
//
// NOTE: named `PipesCreateCatDto` (not `CreateCatDto`) to avoid OpenAPI schema collision with
// `openapi/CreateCatDto` when both demo modules are loaded — @nestjs/swagger warns "defined
// multiple times with different schemas" and will throw in its next major.
export class PipesCreateCatDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsInt()
  @Min(0)
  age!: number;
}
