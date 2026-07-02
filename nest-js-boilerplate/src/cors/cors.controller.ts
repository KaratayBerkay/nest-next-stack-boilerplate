import { Controller, Get } from '@nestjs/common';

// CORS is enabled app-wide in main.ts via app.enableCors(). This endpoint exists so the
// behaviour (preflight + actual-request headers) can be asserted in an e2e test.
@Controller('cors')
export class CorsController {
  @Get('ping')
  ping(): { ok: true } {
    return { ok: true };
  }
}
