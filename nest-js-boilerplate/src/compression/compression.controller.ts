import { Controller, Get } from '@nestjs/common';

// compression() is applied app-wide in main.ts. gzip only kicks in above the middleware's
// 1 KB threshold and when the client advertises `Accept-Encoding: gzip`, so this endpoint
// returns a deliberately large payload.
@Controller('compression')
export class CompressionController {
  @Get('payload')
  payload(): { items: string[] } {
    return {
      items: Array.from(
        { length: 500 },
        (_, i) => `compressible-item-number-${i}`,
      ),
    };
  }
}
