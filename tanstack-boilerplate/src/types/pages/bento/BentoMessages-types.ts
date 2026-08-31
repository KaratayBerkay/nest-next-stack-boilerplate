export interface BentoMessages {
  [key: string]: string;
}

export interface PagesWithBentoMessages {
  bento: BentoMessages;
}
