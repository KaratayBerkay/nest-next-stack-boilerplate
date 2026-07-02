import { Controller, Get } from '@nestjs/common';

/**
 * Router module (#110) — second child controller. OrdersModule is a sibling of ProductsModule under
 * ShopModule, so RouterModule prefixes it `shop` + `orders` → `GET /shop/orders`.
 */
@Controller()
export class OrdersController {
  @Get()
  list(): { route: string } {
    return { route: 'shop/orders' };
  }
}
