import { IsInt, IsString, Min, MinLength } from 'class-validator';

// A plain DTO carrying class-validator decorators. The custom CustomValidationPipe reads this class
// as the param's `metatype`, rebuilds an instance with plainToInstance and runs these validators.
export class CreateCatDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsInt()
  @Min(0)
  age!: number;
}
