"use client";

import { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { StripeElements } from "@/components/StripeProvider";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { AddPaymentMethodFormProps } from "@/types/billing/AddPaymentMethodForm-types";

// Settings' "add a card" flow — same SetupIntent + PaymentElement mechanism
// as checkout's StripeCardForm, but deliberately doesn't call subscribe()
// afterward: this just saves a card to the customer, with no tier/plan
// change implied. onSuccess is a plain callback (no SubscribeResult) since
// there's nothing subscription-shaped to report back.
export function AddPaymentMethodForm({
  onSuccess,
  onError,
}: AddPaymentMethodFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const t = useMessages("settings");

  useEffect(() => {
    let cancelled = false;
    void import("@/api/server/billing/stripe").then(
      ({ createSetupIntentServer }) => {
        createSetupIntentServer()
          .then((data) => {
            if (!cancelled) setClientSecret(data.clientSecret);
          })
          .catch((err: Error) => {
            if (!cancelled) {
              onError(err.message || t.initializePaymentFailed);
            }
          });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [onError, t.initializePaymentFailed]);

  if (!clientSecret) {
    return <div className="text-muted text-sm">{t.loading}</div>;
  }

  return (
    <StripeElements clientSecret={clientSecret}>
      <AddPaymentMethodFormInner onSuccess={onSuccess} onError={onError} />
    </StripeElements>
  );
}

function AddPaymentMethodFormInner({
  onSuccess,
  onError,
}: AddPaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const t = useMessages("settings");

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      onError(submitError.message ?? t.validationFailed);
      setSubmitting(false);
      return;
    }

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message ?? t.saveCardFailed);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || submitting} className="w-full">
        {submitting ? t.saving : t.savePaymentMethod}
      </Button>
    </form>
  );
}
