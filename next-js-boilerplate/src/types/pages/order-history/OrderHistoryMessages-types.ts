export interface OrderHistoryMessages {
  [key: string]: string;
}

export interface PagesWithOrderHistoryMessages {
  orderHistory: OrderHistoryMessages;
}
