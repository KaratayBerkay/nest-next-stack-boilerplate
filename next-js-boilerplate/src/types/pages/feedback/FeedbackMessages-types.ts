export interface FeedbackMessages {
  [key: string]: string;
}

export interface PagesWithFeedbackMessages {
  feedback: FeedbackMessages;
}
