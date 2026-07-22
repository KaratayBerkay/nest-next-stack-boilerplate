export const PLANS = [
  { value: "free", label: "Free", monthly: 0, yearly: 0 },
  { value: "basic", label: "Basic", monthly: 9, yearly: 86 },
  { value: "pro", label: "Pro", monthly: 29, yearly: 278 },
  { value: "enterprise", label: "Enterprise", monthly: 99, yearly: 950 },
];

export const PAYMENT_METHODS = [
  { value: "visa", label: "Visa **** 4242" },
  { value: "mastercard", label: "Mastercard **** 5555" },
  { value: "paypal", label: "PayPal (user@example.com)" },
];

export const VALID_COUPONS: Record<string, { pct: number }> = {
  SAVE10: { pct: 10 },
  WELCOME20: { pct: 20 },
};
