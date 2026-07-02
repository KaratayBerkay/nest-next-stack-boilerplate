import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';

/** Router module (#110) — child of ShopModule; gets the composed `shop/orders` prefix. */
@Module({ controllers: [OrdersController] })
export class OrdersModule {}
