import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { SharedProduct } from './models/shared-product.model';

@Resolver(() => SharedProduct)
export class ProductsResolver {
  private sample(): SharedProduct {
    const product = new SharedProduct();
    product.name = 'Widget';
    product.priceCents = 1000;
    return product;
  }

  @Query(() => SharedProduct, { name: 'product' })
  product(): SharedProduct {
    return this.sample();
  }

  // Backend reuse of the model's shared domain logic — the same method a frontend bundle calls.
  @Query(() => Int, { name: 'productDiscountedCents' })
  productDiscountedCents(
    @Args('percentOff', { type: () => Int }) percentOff: number,
  ): number {
    return this.sample().discountedCents(percentOff);
  }
}
