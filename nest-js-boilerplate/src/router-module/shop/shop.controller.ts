import { Controller, Get } from '@nestjs/common';

/**
 * Router module (#110) — the parent module's controller. Its `@Controller()` path is empty, so the
 * only prefix it gets is the one RouterModule assigns to `ShopModule` (`shop`) → `GET /shop`.
 */
@Controller()
export class ShopController {
  @Get()
  getShop(): { route: string } {
    return { route: 'shop' };
  }
}
