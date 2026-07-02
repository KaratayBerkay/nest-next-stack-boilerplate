import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';

/** Router module (#110) — parent feature module; RouterModule assigns it the `shop` prefix. */
@Module({ controllers: [ShopController] })
export class ShopModule {}
