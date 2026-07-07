"use client";

import { useState, useEffect } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiFetchJson } from "@/lib/api-client";
import { StripeElements } from "@/components/StripeProvider";

export function StripeCardForm({
  tier,
  onSuccess,
  onError,
}: {
  tier: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchJson<{ clientSecret: string }>("/api/billing/create-setup-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    })
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => {
        onError((err as { msg?: string }).msg ?? "Failed to initialize payment");
        setLoading(false);
      });
  }, [tier, onError]);

  if (!clientSecret) {
    return (
      <div className="text-sm text-muted">
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

function StripeCardFormInner({
  tier,
  onSuccess,
  onError,
}: {
  tier: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  // fallow-ignore-next-line complexity
  const handleSubmit = async (e: React.FormEvent) => {
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
      await apiFetchJson("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          paymentMethodId: setupIntent.payment_method,
        }),
      });
      onSuccess();
    } catch (err) {
      onError((err as { msg?: string }).msg ?? "Subscription failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
