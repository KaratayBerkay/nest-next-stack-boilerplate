"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { StripeElements } from "@/components/StripeProvider";
import type { StripeCardFormProps } from "@/types/billing/StripeCardForm-types";
import { useBillingActions } from "@/api/client/billing/actions";

export function StripeCardForm({
  tier,
  onSuccess,
  onError,
}: StripeCardFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { createSetupIntent } = useBillingActions();

  useEffect(() => {
    createSetupIntent(tier)
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => {
        onError((err as Error).message ?? "Failed to initialize payment");
        setLoading(false);
      });
  }, [tier, onError, createSetupIntent]);

  if (!clientSecret) {
    return (
      <div className="text-muted text-sm">
        {loading ? "Initializing payment..." : ""}
      </div>
    );
  }

  return (
    <StripeElements clientSecret={clientSecret}>
      <StripeCardFormInner
        tier={tier}
        onSuccess={onSuccess}
        onError={onError}
      />
    </StripeElements>
  );
}

async function handleStripeSubmit(
  e: React.SyntheticEvent,
  stripe: ReturnType<typeof useStripe>,
  elements: ReturnType<typeof useElements>,
  tier: string,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  onSuccess: () => void,
  onError: (msg: string) => void,
  subscribe: (tier: string, paymentMethodId?: string) => Promise<void>,
) {
  e.preventDefault();
  if (!stripe || !elements) return;

  setSubmitting(true);

  const { error: submitError } = await elements.submit();
  if (submitError) {
    onError(submitError.message ?? "Validation failed");
    setSubmitting(false);
    return;
  }

  const { error, setupIntent } = await stripe.confirmSetup({
    elements,
    confirmParams: {
      return_url: window.location.href,
    },
    redirect: "if_required",
  });

  if (error) {
    onError(error.message ?? "Payment failed");
    setSubmitting(false);
    return;
  }

  if (!setupIntent?.payment_method) {
    onError("No payment method returned");
    setSubmitting(false);
    return;
  }

  try {
    await subscribe(tier, setupIntent.payment_method as string | undefined);
    onSuccess();
  } catch (err) {
    onError((err as Error).message ?? "Subscription failed");
  } finally {
    setSubmitting(false);
  }
}

function StripeCardFormInner({
  tier,
  onSuccess,
  onError,
}: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const { subscribe } = useBillingActions();

  return (
    <form
      onSubmit={(e) =>
        handleStripeSubmit(
          e,
          stripe,
          elements,
          tier,
          setSubmitting,
          onSuccess,
          onError,
          subscribe,
        )
      }
      className="flex flex-col gap-4"
    >
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="bg-brand mt-2 w-full rounded-lg px-4 py-2 text-sm font-medium text-brand-fg hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Processing..." : "Subscribe"}
      </button>
    </form>
  );
}
