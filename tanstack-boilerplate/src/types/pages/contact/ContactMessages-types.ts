export interface ContactMessages {
  [key: string]: string;
}

export interface PagesWithContactMessages {
  contact: ContactMessages;
}
