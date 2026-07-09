export interface StripeCardFormProps {
  tier: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}
