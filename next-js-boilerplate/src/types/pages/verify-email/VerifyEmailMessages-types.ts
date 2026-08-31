export interface VerifyEmailMessages {
  [key: string]: string;
}

export interface PagesWithVerifyEmailMessages {
  verifyEmail: VerifyEmailMessages;
}
