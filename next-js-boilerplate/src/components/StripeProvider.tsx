"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo } from "react";
import type { StripeElementsProps } from "@/types/billing/StripeElements-types";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY;

const stripePromise = stripeKey
  ? loadStripe(stripeKey as string)
  : null;

export function StripeElements({
  clientSecret,
  children,
}: StripeElementsProps) {
  const options = useMemo(
    () => (clientSecret ? { clientSecret } : undefined),
    [clientSecret],
  );

  if (!stripePromise || !options) return <>{children}</>;

  return <Elements stripe={stripePromise} options={options}>{children}</Elements>;
}
