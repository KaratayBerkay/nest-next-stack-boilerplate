"use client";

import { useState } from "react";
import {
  mockCardFormSchema,
  formatCardNumber,
  getLast4,
} from "@/lib/validation/billing";
import { apiFetchJson } from "@/lib/api-client";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface MockCardFormProps {
  tier: string;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

const TEST_CARDS = [
  { last4: "4242", label: "4242 — Approved" },
  { last4: "0002", label: "0002 — Declined" },
  { last4: "9995", label: "9995 — Insufficient funds" },
];

export function MockCardForm({ tier, onSuccess, onError }: MockCardFormProps) {
  const t = useMessages("checkout");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const errors = {
    cardNumberRequired: t.cardNumberRequired,
    cardNumberInvalid: t.invalidCardNumber,
    expiryRequired: t.expiryRequired,
    expiryInvalid: t.invalidExpiry,
    expiryPast: t.cardExpired,
    cvcRequired: t.cvcRequired,
    cvcInvalid: t.invalidCvc,
    nameRequired: t.nameRequired,
  };

  const schema = mockCardFormSchema(errors);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const result = schema.safeParse({
      cardNumber: cardNumber.replace(/\s/g, ""),
      expMonth,
      expYear,
      cvc,
      cardholderName,
    });

    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      const errs: Record<string, string> = {};
      for (const [field, msgs] of Object.entries(flat)) {
        if (msgs && msgs.length > 0) errs[field] = msgs[0];
      }
      if (result.error.issues.some((i) => i.path.length === 0)) {
        errs.form = result.error.issues[0].message;
      }
      setFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await apiFetchJson("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          last4: getLast4(cardNumber),
          expMonth: parseInt(expMonth, 10),
          expYear: parseInt(expYear, 10),
        }),
      });
      onSuccess?.();
    } catch (err) {
      const msg =
        (err as { msg?: string }).msg ?? "Payment failed. Please try again.";
      if ((err as { field?: string }).field) {
        setFieldErrors({ [(err as { field: string }).field]: msg });
      } else {
        setFieldErrors({ form: msg });
      }
      onError?.(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="mock-card-form">
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="mb-3 text-sm text-muted">{t.testCards}</p>
        <div className="flex flex-wrap gap-2">
          {TEST_CARDS.map((tc) => (
            <button
              key={tc.last4}
              type="button"
              className="rounded border border-border px-2 py-1 text-xs hover:bg-accent"
              onClick={() => setCardNumber(tc.last4.padStart(16, "0"))}
              data-testid={`test-card-${tc.last4}`}
            >
              {tc.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium">
          {t.cardNumber}
        </label>
        <input
          id="cardNumber"
          data-testid="card-number"
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          className="mt-1 block w-full rounded border border-border bg-bg px-3 py-2 text-sm"
        />
        {fieldErrors.cardNumber && (
          <p className="mt-0.5 text-xs text-red-600">{fieldErrors.cardNumber}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="expMonth" className="block text-sm font-medium">
            {t.month}
          </label>
          <input
            id="expMonth"
            data-testid="exp-month"
            type="text"
            inputMode="numeric"
            placeholder={t.mm}
            maxLength={2}
            value={expMonth}
            onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
            className="mt-1 block w-full rounded border border-border bg-bg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="expYear" className="block text-sm font-medium">
            {t.year}
          </label>
          <input
            id="expYear"
            data-testid="exp-year"
            type="text"
            inputMode="numeric"
            placeholder={t.yy}
            maxLength={2}
            value={expYear}
            onChange={(e) => setExpYear(e.target.value.replace(/\D/g, "").slice(0, 2))}
            className="mt-1 block w-full rounded border border-border bg-bg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="cvc" className="block text-sm font-medium">
            CVC
          </label>
          <input
            id="cvc"
            data-testid="cvc"
            type="text"
            inputMode="numeric"
            placeholder="123"
            maxLength={4}
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="mt-1 block w-full rounded border border-border bg-bg px-3 py-2 text-sm"
          />
        </div>
      </div>
      {(fieldErrors.expiry || fieldErrors.form) && (
        <p className="text-xs text-red-600">
          {fieldErrors.expiry ?? fieldErrors.form}
        </p>
      )}

      <div>
        <label htmlFor="cardholderName" className="block text-sm font-medium">
          {t.cardholderName}
        </label>
        <input
          id="cardholderName"
          data-testid="cardholder-name"
          type="text"
          autoComplete="cc-name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          className="mt-1 block w-full rounded border border-border bg-bg px-3 py-2 text-sm"
        />
        {fieldErrors.cardholderName && (
          <p className="mt-0.5 text-xs text-red-600">{fieldErrors.cardholderName}</p>
        )}
      </div>

      {fieldErrors.form && !fieldErrors.expiry && (
        <p className="text-sm text-red-600" data-testid="form-error">
          {fieldErrors.form}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        data-testid="submit-payment"
        className="w-full rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
      >
        {submitting ? t.processing : t.subscribeTo.replace("{tier}", tier)}
      </button>
    </form>
  );
}
