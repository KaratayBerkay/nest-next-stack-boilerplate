import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CatBreed } from './cat-breed.enum';
import { Cat } from './cat.entity';
import { CreateCatDto } from './create-cat.dto';
import { PaginatedCatsDto } from './paginated-cats.dto';
import {
  FullCatDto,
  OmitNameCatDto,
  UpdateCatAgeDto,
  UpdateCatDto,
} from './update-cat.dto';

/**
 * Operations + Security (docs.nestjs.com/openapi/operations, /openapi/security).
 *
 * - `@ApiTags('cats')`   groups every operation under the `cats` tag.
 * - `@ApiBearerAuth()`   marks the whole controller as requiring the `bearer` security scheme.
 * - `@ApiExtraModels()`  forces the mapped-type / generic models into `components.schemas` even
 *                        though no route references them as a body or response `type`.
 */
@ApiTags('cats')
@ApiBearerAuth()
@ApiExtraModels(PaginatedCatsDto, UpdateCatAgeDto, OmitNameCatDto, FullCatDto)
@Controller('cats')
export class CatsController {
  private readonly cat: Cat = {
    id: 1,
    name: 'Maru',
    age: 3,
    breed: CatBreed.Tabby,
  };

  @Post()
  @ApiOperation({ summary: 'Create a cat' })
  @ApiCreatedResponse({
    description: 'The cat has been successfully created.',
    type: Cat,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() dto: CreateCatDto): Cat {
    return { ...this.cat, name: dto.name, age: dto.age, breed: dto.breed };
  }

  @Get()
  @ApiOperation({ summary: 'List cats' })
  @ApiQuery({ name: 'breed', enum: CatBreed, required: false })
  // Generic envelope: allOf(PaginatedCatsDto, { results: Cat[] }) via raw getSchemaPath refs.
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedCatsDto) },
        {
          properties: {
            results: { type: 'array', items: { $ref: getSchemaPath(Cat) } },
          },
        },
      ],
    },
  })
  findAll(@Query('breed') breed?: CatBreed): {
    total: number;
    limit: number;
    offset: number;
    results: Cat[];
  } {
    const results = breed
      ? [this.cat].filter((c) => c.breed === breed)
      : [this.cat];
    return { total: results.length, limit: 10, offset: 0, results };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find one cat' })
  @ApiParam({ name: 'id', description: 'Cat identifier', example: 1 })
  @ApiOkResponse({ type: Cat })
  findOne(@Param('id') id: string): Cat {
    return { ...this.cat, id: Number(id) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a cat' })
  @ApiOkResponse({ type: Cat })
  update(@Param('id') id: string, @Body() dto: UpdateCatDto): Cat {
    return { ...this.cat, id: Number(id), ...dto };
  }
}
