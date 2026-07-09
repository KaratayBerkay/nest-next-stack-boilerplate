"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { apiFetchJson } from "@/lib/api-client";
import { StripeElements } from "@/components/StripeProvider";
import type { StripeCardFormProps } from "@/types/billing/StripeCardForm-types";
import {
  STRIPE_CREATE_SETUP_INTENT_URL,
  STRIPE_SUBSCRIBE_URL,
} from "@/constants/api/urls";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import { POST } from "@/constants/api/methods";

export function StripeCardForm({
  tier,
  onSuccess,
  onError,
}: StripeCardFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchJson<{ clientSecret: string }>(STRIPE_CREATE_SETUP_INTENT_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({ tier }),
    })
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => {
        onError((err as Error).message ?? "Failed to initialize payment");
        setLoading(false);
      });
  }, [tier, onError]);

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
    await apiFetchJson(STRIPE_SUBSCRIBE_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({
        tier,
        paymentMethodId: setupIntent.payment_method,
      }),
    });
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
        )
      }
      className="flex flex-col gap-4"
    >
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="bg-brand mt-2 w-full rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Processing..." : "Subscribe"}
      </button>
    </form>
  );
}
