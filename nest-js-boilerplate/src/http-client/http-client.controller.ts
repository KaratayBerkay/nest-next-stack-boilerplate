import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RemoteApiService } from './remote-api.service';

@Controller('http-client')
export class HttpClientController {
  constructor(private readonly api: RemoteApiService) {}

  @Get('config')
  config(): { timeout?: number; maxRedirects?: number } {
    return this.api.config();
  }

  @Get('fetch')
  fetch(@Query('url') url: string): Promise<unknown> {
    return this.api.fetchJson(url);
  }

  @Get('fetch-raw')
  fetchRaw(
    @Query('url') url: string,
  ): Promise<{ status: number; data: unknown }> {
    return this.api.fetchViaAxiosRef(url);
  }

  @Get('fetch-or-fail')
  fetchOrFail(@Query('url') url: string): Promise<unknown> {
    return this.api.fetchOrFail(url);
  }

  @Post('post')
  post(@Query('url') url: string, @Body() body: unknown): Promise<unknown> {
    return this.api.postJson(url, body);
  }
}
