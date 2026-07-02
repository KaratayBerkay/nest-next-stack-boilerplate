import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Headers,
  HttpCode,
  Ip,
  Param,
  Post,
  Put,
  Query,
  Redirect,
} from '@nestjs/common';
import type { HttpRedirectResponse } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { ListAllEntities } from './dto/list-all-entities.dto';
import { UpdateCatDto } from './dto/update-cat.dto';

interface Cat {
  id: string;
  name: string;
  age: number;
  breed: string;
}

// The docs' canonical CatsController, exercising every documented controller capability:
// routing (@Get/@Post/@Put/@Delete), @Param/@Query/@Body, @HttpCode, @Header, @Headers, @Ip,
// @Redirect (static + dynamic), and an Express 5 named wildcard route. Static routes are
// declared BEFORE the ':id' param route, per the docs ("declare params after static paths").
@Controller('cats')
export class CatsController {
  private readonly cats: Cat[] = [];

  // POST defaults to 201; @Body binds the request payload to the DTO.
  @Post()
  create(@Body() dto: CreateCatDto): { created: CreateCatDto } {
    this.cats.push({ id: String(this.cats.length + 1), ...dto });
    return { created: dto };
  }

  @Get()
  findAll(@Query() query: ListAllEntities): { limit: number; cats: Cat[] } {
    const limit = Number(query.limit ?? 10);
    return { limit, cats: this.cats.slice(0, limit) };
  }

  // --- static routes (must precede ':id') ---

  // Override the default status code.
  @Post('no-content')
  @HttpCode(204)
  noContent(): void {}

  // Set a custom response header.
  @Get('cached')
  @Header('Cache-Control', 'no-store')
  cached(): { cached: boolean } {
    return { cached: true };
  }

  // Read a request header and the client IP.
  @Get('inspect')
  inspect(
    @Headers('x-custom') custom: string | undefined,
    @Ip() ip: string,
  ): { custom: string | null; ip: string } {
    return { custom: custom ?? null, ip };
  }

  // Static redirect by default; a dynamic one when ?version=5 (returns HttpRedirectResponse).
  @Get('docs')
  @Redirect('https://docs.nestjs.com', 302)
  docs(@Query('version') version?: string): HttpRedirectResponse | void {
    if (version === '5') {
      return { url: 'https://docs.nestjs.com/v5/', statusCode: 302 };
    }
  }

  // Express 5 named wildcard: `*splat` captures the trailing path segments as an array.
  @Get('files/*splat')
  files(@Param('splat') splat: string[] | string): { path: string[] } {
    return { path: Array.isArray(splat) ? splat : splat.split('/') };
  }

  // --- param routes ---

  @Get(':id')
  findOne(@Param('id') id: string): { id: string } {
    return { id };
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCatDto,
  ): { id: string; update: UpdateCatDto } {
    return { id, update: dto };
  }

  @Delete(':id')
  remove(@Param('id') id: string): { removed: string } {
    return { removed: id };
  }
}
