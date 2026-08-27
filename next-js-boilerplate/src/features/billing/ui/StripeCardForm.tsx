"use client";

import {
  useState,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { StripeElements } from "@/components/StripeProvider";
import { Button } from "@/components/ui/Button";
import type { StripeCardFormProps } from "@/types/billing/StripeCardForm-types";
import type { SubscribeResult } from "@/api/server/billing/stripe";
import { useBillingActions } from "@/api/client/billing/actions";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { tierLabel } from "@/lib/tier";
import type { I18nMessages } from "@/generated/i18n-messages";

export function StripeCardForm({
  tier,
  onSuccess,
  onError,
}: StripeCardFormProps) {
  const t = useMessages("checkout");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { createSetupIntent } = useBillingActions();

  useEffect(() => {
    createSetupIntent(tier)
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => {
        onError((err as Error).message ?? t.initializePaymentFailed);
        setLoading(false);
      });
  }, [tier, onError, createSetupIntent, t.initializePaymentFailed]);

  if (!clientSecret) {
    return (
      <div className="text-muted text-sm">
        {loading ? t.initializingPayment : ""}
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
  onSuccess: (result: SubscribeResult) => void,
  onError: (msg: string) => void,
  subscribe: (
    tier: string,
    paymentMethodId?: string,
    idempotencyKey?: string,
    currentTier?: string,
    currency?: string,
  ) => Promise<SubscribeResult>,
  retryKeyRef: React.MutableRefObject<string | null>,
  currency: string,
  t: I18nMessages["checkout"],
) {
  e.preventDefault();
  if (!stripe || !elements) return;

  setSubmitting(true);

  const { error: submitError } = await elements.submit();
  if (submitError) {
    onError(submitError.message ?? t.validationFailed);
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
    onError(error.message ?? t.paymentFailedGeneric);
    setSubmitting(false);
    return;
  }

  if (!setupIntent?.payment_method) {
    onError(t.noPaymentMethodReturned);
    setSubmitting(false);
    return;
  }

  try {
    // One idempotency key per subscribe flow: a retry after a network
    // failure reuses it so the server can recognize (and dedupe) a charge
    // that may already have committed. Cleared only on definitive success;
    // kept on failure so a timeout-then-retry never double-charges.
    const retryKey =
      retryKeyRef.current ?? (retryKeyRef.current = crypto.randomUUID());
    const result = await subscribe(
      tier,
      setupIntent.payment_method as string | undefined,
      retryKey,
      undefined,
      currency,
    );
    retryKeyRef.current = null;
    onSuccess(result);
  } catch (err) {
    onError((err as Error).message ?? t.subscriptionFailed);
  } finally {
    setSubmitting(false);
  }
}

function StripeCardFormInner({
  tier,
  onSuccess,
  onError,
}: StripeCardFormProps) {
  const t = useMessages("checkout");
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const { subscribe } = useBillingActions();
  const retryKeyRef = useRef<string | null>(null);
  const currency = useCurrencyCookie();

  useEffect(() => {
    retryKeyRef.current = crypto.randomUUID();
  }, [tier]);

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
          retryKeyRef,
          currency,
          t,
        )
      }
      className="flex flex-col gap-4"
    >
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || submitting}
        className="mt-2 w-full"
      >
        {submitting
          ? t.processing
          : t.subscribeTo.replace("{tier}", tierLabel(tier))}
      </Button>
    </form>
  );
}
