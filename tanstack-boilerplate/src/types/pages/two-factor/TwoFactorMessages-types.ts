export interface TwoFactorMessages {
  [key: string]: string;
}

export interface PagesWithTwoFactorMessages {
  twoFactor: TwoFactorMessages;
}
