import { Controller, Get, Param } from '@nestjs/common';

/**
 * Router module (#110) — a child module's controller. ProductsModule is a child of ShopModule, so
 * RouterModule composes the prefixes recursively (`shop` + `products`). Combined with each method's
 * own path that yields `GET /shop/products`, `GET /shop/products/featured`, `GET /shop/products/:id`.
 */
@Controller()
export class ProductsController {
  @Get()
  list(): { route: string } {
    return { route: 'shop/products' };
  }

  @Get('featured')
  featured(): { route: string } {
    return { route: 'shop/products/featured' };
  }

  @Get(':id')
  one(@Param('id') id: string): { route: string; id: string } {
    return { route: 'shop/products/:id', id };
  }
}
