export interface ShoppingCartMessages {
  [key: string]: string;
}

export interface PagesWithShoppingCartMessages {
  shoppingCart: ShoppingCartMessages;
}
