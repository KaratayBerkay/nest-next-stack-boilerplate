export interface ServiceMessages {
  [key: string]: string;
}

export interface PagesWithServiceMessages {
  service: ServiceMessages;
}
