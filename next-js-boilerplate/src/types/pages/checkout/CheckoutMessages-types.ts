export interface CheckoutMessages {
  [key: string]: string;
}

export interface PagesWithCheckoutMessages {
  checkout: CheckoutMessages;
}
