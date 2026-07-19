"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { formOptions, useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { useToast } from "@/components/ui/Toast";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { getSurface, exceptionHandler } from "@/lib/exception-handler";
import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import { createBillingFieldSchemas } from "@/validators/forms/billing";
import { billingDefaultValues } from "@/validators/forms/billing-inits";
import type { ExceptionResponse } from "@/lib/api-client";

const PLANS = [
  { value: "free", label: "Free", monthly: 0, yearly: 0 },
  { value: "basic", label: "Basic", monthly: 9, yearly: 86 },
  { value: "pro", label: "Pro", monthly: 29, yearly: 278 },
  { value: "enterprise", label: "Enterprise", monthly: 99, yearly: 950 },
];

const PAYMENT_METHODS = [
  { value: "visa", label: "Visa **** 4242" },
  { value: "mastercard", label: "Mastercard **** 5555" },
  { value: "paypal", label: "PayPal (user@example.com)" },
];

const VALID_COUPONS: Record<string, { pct: number }> = {
  SAVE10: { pct: 10 },
  WELCOME20: { pct: 20 },
};

function calcPrice(
  plan: string,
  period: string,
): { subtotal: number; discountLabel: string | null; total: number } {
  const p = PLANS.find((x) => x.value === plan) ?? PLANS[0];
  const subtotal = period === "yearly" ? p.yearly : p.monthly;
  const discountLabel = period === "yearly" && p.monthly > 0 ? "20% off" : null;
  return { subtotal, discountLabel, total: subtotal };
}

function CouponStatus({
  code,
  period,
  t,
}: {
  code: string;
  period: string;
  t: Record<string, string>;
}) {
  if (!code) return null;
  const upper = code.toUpperCase();
  const coupon = VALID_COUPONS[upper];
  if (!coupon) return null;
  const price = calcPrice("pro", period);
  const discount = Math.round(price.subtotal * (coupon.pct / 100));
  return (
    <span className="text-success text-xxs">
      {t.couponApplied} — ${discount} {t.couponOff}
    </span>
  );
}

async function handleCouponBlur(
  value: string,
  deps: {
    simulateError: (
      id: string,
      opts?: { delayMs?: number },
    ) => Promise<ExceptionResponse>;
    toast: (opts: {
      description: string;
      variant?: "destructive" | "default";
    }) => void;
    allMessages: Record<string, unknown>;
  },
): Promise<string | undefined> {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  if (VALID_COUPONS[upper]) return undefined;
  try {
    await deps.simulateError(
      upper === "EXPIRED10" ? "coupon-expired" : "coupon-invalid",
    );
    return undefined;
  } catch (err) {
    const exc = (err as { exception?: ExceptionResponse }).exception;
    if (!exc) return undefined;
    if (getSurface(exc.exc) === "toast") {
      deps.toast({
        description: exceptionHandler(exc, deps.allMessages),
        variant: "destructive",
      });
      return undefined;
    }
    return exceptionToFormErrors(exc, deps.allMessages).fields.couponCode;
  }
}

export default function BillingPage() {
  const t = useMessages("forms");
  const allMessages = useAllMessages();
  const fieldSchemas = useMemo(() => createBillingFieldSchemas(t.billing), [t]);
  const { toast } = useToast();
  const { simulateError } = useFormsDemoActions();
  const prevPlan = useRef("pro");

  const form = useAppForm({
    ...formOptions({
      defaultValues: billingDefaultValues,
    }),
  });

  const { plan, billingPeriod, couponCode, isDirty } = useStore(
    form.store,
    (s) => ({
      plan: s.values.plan,
      billingPeriod: s.values.billingPeriod,
      couponCode: s.values.couponCode,
      isDirty: s.isDirty,
    }),
  );

  const price = useMemo(
    () => calcPrice(plan, billingPeriod),
    [plan, billingPeriod],
  );

  useEffect(() => {
    if (plan !== prevPlan.current) {
      prevPlan.current = plan;
      form.setFieldValue("couponCode", "");
    }
  }, [plan, form]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">{t.billing.heading}</h2>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xxs text-muted">{t.billing.unsaved}</span>
          )}
        </div>
      </div>

      <form className="flex flex-col gap-4">
        <form.AppField name="plan" validators={{ onChange: fieldSchemas.plan }}>
          {(field) => (
            <field.RadioGroupField
              label={t.billing.plan}
              options={PLANS.map((p) => ({
                value: p.value,
                label: `${p.label} — $${p.monthly}/mo${p.yearly > 0 ? ` ($${p.yearly}/yr)` : ""}`,
              }))}
            />
          )}
        </form.AppField>

        <form.AppField
          name="billingPeriod"
          validators={{ onChange: fieldSchemas.billingPeriod }}
        >
          {(field) => (
            <field.RadioGroupField
              label={t.billing.billingPeriod}
              options={[
                { value: "monthly", label: t.billing.monthly },
                { value: "yearly", label: t.billing.yearly },
              ]}
            />
          )}
        </form.AppField>

        <form.AppField name="paymentMethod">
          {(field) => (
            <field.SelectField
              label={t.billing.paymentMethod}
              options={PAYMENT_METHODS}
            />
          )}
        </form.AppField>

        <form.AppField
          name="couponCode"
          validators={{
            onBlurAsync: async ({ value }) =>
              handleCouponBlur(value, { simulateError, toast, allMessages }),
            onBlurAsyncDebounceMs: 300,
          }}
        >
          {(field) => (
            <field.TextField
              label={t.billing.couponCode}
              placeholder={t.billing.couponPlaceholder}
            />
          )}
        </form.AppField>

        <CouponStatus code={couponCode} period={billingPeriod} t={t.billing} />

        <form.AppField name="taxId">
          {(field) => (
            <field.TextField
              label={t.billing.taxId}
              placeholder={t.billing.taxIdPlaceholder}
            />
          )}
        </form.AppField>

        <Separator />

        <div className="flex flex-col gap-1 text-xs">
          <div className="flex justify-between">
            <span>{t.billing.subtotal}</span>
            <span>${price.subtotal}</span>
          </div>
          {price.discountLabel && (
            <div className="text-success flex justify-between">
              <span>{t.billing.discount}</span>
              <span>-{price.discountLabel}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span>{t.billing.total}</span>
            <span>${price.total}</span>
          </div>
        </div>

        <Button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            toast({ description: t.billing.saveSuccess, variant: "default" });
          }}
        >
          {t.billing.updateButton}
        </Button>
      </form>
    </div>
  );
}
