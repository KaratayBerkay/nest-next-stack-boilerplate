import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';

/** Router module (#110) — child of ShopModule; gets the composed `shop/products` prefix. */
@Module({ controllers: [ProductsController] })
export class ProductsModule {}
