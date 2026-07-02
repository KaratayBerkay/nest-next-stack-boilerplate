import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { ShopModule } from './shop/shop.module';

/**
 * Recipes › Router module (#110). `RouterModule.register(...)` assigns URL prefixes to whole
 * modules and nests them hierarchically, so controllers don't have to hard-code shared prefixes in
 * every `@Controller()`.
 *
 * Per the docs caveat, the feature modules are **still imported separately** — `RouterModule.register`
 * only declares the prefix tree; it does not import the modules. The tree here resolves to:
 *   ShopModule       → /shop
 *   ProductsModule   → /shop/products   (child of shop)
 *   OrdersModule     → /shop/orders     (child of shop)
 * and each controller's own method paths append (e.g. /shop/products/featured).
 *
 * Self-contained: this module owns the whole subtree, so AppModule only imports RouterDemoModule.
 */
@Module({
  imports: [
    ShopModule,
    ProductsModule,
    OrdersModule,
    RouterModule.register([
      {
        path: 'shop',
        module: ShopModule,
        children: [
          { path: 'products', module: ProductsModule },
          { path: 'orders', module: OrdersModule },
        ],
      },
    ]),
  ],
})
export class RouterDemoModule {}
