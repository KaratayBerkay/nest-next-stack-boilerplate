"use client";

import { useState, useRef, useCallback } from "react";
import {
  mockCardFormSchema,
  getLast4,
} from "@/lib/validation/billing";
import { apiFetchJson } from "@/lib/api-client";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

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

  const containerRef = useRef<HTMLDivElement>(null);
  const [blocks, setBlocks] = useState(["", "", "", ""]);

  const getFullCardNumber = useCallback(() => blocks.join(""), [blocks]);

  const handleBlockChange = useCallback((index: number, value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setBlocks((prev) => {
      const next = [...prev];
      next[index] = digits;
      return next;
    });
    if (digits.length === 4 && index < 3 && containerRef.current) {
      const inputs = containerRef.current.querySelectorAll<HTMLInputElement>("input");
      inputs[index + 1]?.focus();
    }
  }, []);

  const handleBlockKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !blocks[index] && index > 0 && containerRef.current) {
      const inputs = containerRef.current.querySelectorAll<HTMLInputElement>("input");
      inputs[index - 1]?.focus();
    }
  }, [blocks]);

  const fillTestCard = useCallback((last4: string) => {
    const full = last4.padStart(16, "0");
    setBlocks([full.slice(0, 4), full.slice(4, 8), full.slice(8, 12), full.slice(12, 16)]);
  }, []);

  const schema = mockCardFormSchema(errors);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const fullCardNumber = getFullCardNumber();
    const result = schema.safeParse({
      cardNumber: fullCardNumber,
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
          last4: getLast4(getFullCardNumber()),
          expMonth: parseInt(expMonth, 10),
          expYear: parseInt(expYear, 10),
        }),
      });
      onSuccess?.();
    } catch (err) {
      const msg =
        (err as { msg?: string }).msg ?? t.paymentFailedGeneric;
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
            <Button
              key={tc.last4}
              type="button"
              variant="outline"
              size="xs"
              onClick={() => fillTestCard(tc.last4)}
              data-testid={`test-card-${tc.last4}`}
            >
              {tc.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="cardNumber">{t.cardNumber}</Label>
        <div ref={containerRef} className="mt-1 flex gap-2">
          {blocks.map((block, i) => (
            <input
              key={i}
              id={i === 0 ? "cardNumber" : undefined}
              data-testid={i === 0 ? "card-number" : undefined}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "cc-number" : "off"}
              placeholder="****"
              maxLength={4}
              value={block}
              onChange={(e) => handleBlockChange(i, e.target.value)}
              onKeyDown={(e) => handleBlockKeyDown(i, e)}
              className="block w-full rounded border border-border bg-bg px-3 py-2 text-sm text-center font-mono"
            />
          ))}
        </div>
        {fieldErrors.cardNumber && (
          <p className="mt-0.5 text-xs text-red-600">{fieldErrors.cardNumber}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="expMonth">{t.month}</Label>
          <Input
            id="expMonth"
            data-testid="exp-month"
            type="text"
            inputMode="numeric"
            placeholder={t.mm}
            maxLength={2}
            value={expMonth}
            onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="expYear">{t.year}</Label>
          <Input
            id="expYear"
            data-testid="exp-year"
            type="text"
            inputMode="numeric"
            placeholder={t.yy}
            maxLength={2}
            value={expYear}
            onChange={(e) => setExpYear(e.target.value.replace(/\D/g, "").slice(0, 2))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="cvc">CVC</Label>
          <Input
            id="cvc"
            data-testid="cvc"
            type="text"
            inputMode="numeric"
            placeholder="123"
            maxLength={4}
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="mt-1"
          />
        </div>
      </div>
      {(fieldErrors.expiry || fieldErrors.form) && (
        <p className="text-xs text-red-600">
          {fieldErrors.expiry ?? fieldErrors.form}
        </p>
      )}

      <div>
        <Label htmlFor="cardholderName">{t.cardholderName}</Label>
        <Input
          id="cardholderName"
          data-testid="cardholder-name"
          type="text"
          autoComplete="cc-name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          className="mt-1"
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

      <Button
        type="submit"
        disabled={submitting}
        variant="primary"
        className="w-full"
        data-testid="submit-payment"
      >
        {submitting ? t.processing : t.subscribeTo.replace("{tier}", tier)}
      </Button>
    </form>
  );
}
