export interface OrderSummaryMessages {
  [key: string]: string;
}

export interface PagesWithOrderSummaryMessages {
  orderSummary: OrderSummaryMessages;
}
