import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateCatDto } from './create-cat.dto';
import { CustomValidationPipe } from './custom-validation.pipe';
import { Sort } from './sort.enum';

// docs.nestjs.com/pipes — each route binds a pipe at parameter scope. Built-in pipes both transform
// (string → number/boolean/array) and validate (reject malformed input with 400), plus one
// hand-written custom pipe on a body DTO. test/pipes.e2e-spec.ts proves each.
@Controller('pipes')
export class PipesController {
  // Transformation + validation: ParseIntPipe turns "42" into the number 42, rejects non-numerics.
  @Get('int/:id')
  parseInt(@Param('id', ParseIntPipe) id: number): {
    id: number;
    type: string;
  } {
    return { id, type: typeof id };
  }

  // Custom options: a malformed id yields 406 Not Acceptable instead of the default 400.
  @Get('strict/:id')
  strictInt(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ): { id: number } {
    return { id };
  }

  // ParseUUIDPipe (v4) validates the shape of a UUID param.
  @Get('uuid/:uuid')
  parseUuid(@Param('uuid', new ParseUUIDPipe({ version: '4' })) uuid: string): {
    uuid: string;
  } {
    return { uuid };
  }

  // ParseEnumPipe ensures the value is one of the Sort members.
  @Get('sort/:sort')
  parseEnum(@Param('sort', new ParseEnumPipe(Sort)) sort: Sort): {
    sort: Sort;
  } {
    return { sort };
  }

  // ParseArrayPipe splits a CSV query and coerces each item to a number.
  @Get('sum')
  sum(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ): { ids: number[]; total: number } {
    return { ids, total: ids.reduce((a, b) => a + b, 0) };
  }

  // DefaultValuePipe chained before a parse pipe: supplies a typed default when the query is absent,
  // which the following ParseBoolPipe/ParseIntPipe then passes through.
  @Get('find')
  find(
    @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe)
    activeOnly: boolean,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
  ): { activeOnly: boolean; page: number } {
    return { activeOnly, page };
  }

  // Custom PipeTransform on the body: validates the DTO via class-validator, 400 on failure.
  @Post('cats')
  createCat(@Body(CustomValidationPipe) dto: CreateCatDto): {
    received: CreateCatDto;
  } {
    return { received: dto };
  }
}
