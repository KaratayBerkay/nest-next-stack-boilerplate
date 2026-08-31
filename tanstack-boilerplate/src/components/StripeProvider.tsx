"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useMemo } from "react";
import type { StripeElementsProps } from "@/types/billing/StripeElements-types";
import { clientEnv } from "@/lib/env";
import { useLang } from "@/hooks/useLang";

// Lazy singleton: reading clientEnv throws if NEXT_PUBLIC_* vars aren't
// present, so this must not run at module-evaluation time — that would
// throw for any code that merely imports this file (e.g. via a shared
// barrel) without ever rendering <StripeElements>.
let stripePromise: Promise<Stripe | null> | null | undefined;

function getStripePromise() {
  if (stripePromise === undefined) {
    const stripeKey = clientEnv.NEXT_PUBLIC_STRIPE_KEY;
    stripePromise = stripeKey ? loadStripe(stripeKey) : null;
  }
  return stripePromise;
}

export function StripeElements({
  clientSecret,
  children,
}: StripeElementsProps) {
  const lang = useLang();
  const options = useMemo(
    () => (clientSecret ? { clientSecret, locale: lang } : undefined),
    [clientSecret, lang],
  );
  const promise = getStripePromise();

  if (!promise || !options) return <>{children}</>;

  return (
    <Elements stripe={promise} options={options}>
      {children}
    </Elements>
  );
}
