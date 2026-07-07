"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo } from "react";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY;

const stripePromise = stripeKey
  ? loadStripe(stripeKey as string)
  : null;

export function StripeElements({
  clientSecret,
  children,
}: {
  clientSecret?: string;
  children: React.ReactNode;
}) {
  const options = useMemo(
    () => (clientSecret ? { clientSecret } : undefined),
    [clientSecret],
  );

  if (!stripePromise || !options) return <>{children}</>;

  return <Elements stripe={stripePromise} options={options}>{children}</Elements>;
}
