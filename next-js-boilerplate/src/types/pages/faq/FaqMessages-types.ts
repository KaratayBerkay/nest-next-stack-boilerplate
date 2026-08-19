export interface FaqMessages {
  [key: string]: string;
}

export interface PagesWithFaqMessages {
  faq: FaqMessages;
}
