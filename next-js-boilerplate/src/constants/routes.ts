export const LOGIN_PATH = "/auth/login" as const;
export const REGISTER_PATH = "/auth/register" as const;
export const FORGOT_PASSWORD_PATH = "/auth/forgot-password" as const;
export const RESET_PASSWORD_PATH = "/auth/reset-password" as const;
const VERIFY_EMAIL_PATH = "/auth/verify-email" as const;
export const FIND_FRIENDS_PATH = "/find-friends" as const;
export const PRICING_PATH = "/pricing" as const;
export const checkoutPath = (tier: string, lang = "en") =>
  `/v1/${lang}/checkout/${tier}` as const;
export const plansPath = (lang = "en") => `/v1/${lang}/plans` as const;
