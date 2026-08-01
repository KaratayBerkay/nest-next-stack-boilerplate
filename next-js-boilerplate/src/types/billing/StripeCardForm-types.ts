import type { SubscribeResult } from "@/api/server/billing/stripe";

export interface StripeCardFormProps {
  tier: string;
  onSuccess: (result: SubscribeResult) => void;
  onError: (msg: string) => void;
}
