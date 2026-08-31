export interface NewsletterMessages {
  [key: string]: string;
}

export interface PagesWithNewsletterMessages {
  newsletter: NewsletterMessages;
}
