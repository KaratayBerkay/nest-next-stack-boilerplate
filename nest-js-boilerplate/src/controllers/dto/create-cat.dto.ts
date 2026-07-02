// DTO as a **class**, per the docs: interfaces are erased at transpile time, so a class is what
// lets pipes/validation (and Nest's metadata) see the shape at runtime. Kept decorator-free here
// because this module demonstrates *routing*, not validation (#26 covers ValidationPipe).
export class CreateCatDto {
  name!: string;
  age!: number;
  breed!: string;
}
