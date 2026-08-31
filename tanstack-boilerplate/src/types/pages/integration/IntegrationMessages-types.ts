export interface IntegrationMessages {
  [key: string]: string;
}

export interface PagesWithIntegrationMessages {
  integration: IntegrationMessages;
}
