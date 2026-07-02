import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  Type,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

// docs.nestjs.com/pipes — "Class validator" custom pipe. A hand-written PipeTransform (distinct
// from the built-in global ValidationPipe verified in #26): it reads the argument's `metatype`,
// rebuilds a typed instance via plainToInstance so the class-validator decorators apply, validates
// it, and throws BadRequestException on failure (otherwise returns the original value untouched).
// Adapted to strict TS: the docs use `any`/`Function`; we use `unknown`/`Type<unknown>`.
@Injectable()
export class CustomValidationPipe implements PipeTransform<unknown> {
  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value) as object;
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }

  // Skip validation for native types (a DTO class has its own constructor, primitives don't).
  private toValidate(metatype: Type<unknown>): boolean {
    const types: Type<unknown>[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
