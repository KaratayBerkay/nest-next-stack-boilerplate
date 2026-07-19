"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { formOptions } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { useToast } from "@/components/ui/Toast";
import { createBillingFieldSchemas } from "@/validators/forms/billing";

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

function calcPrice(plan: string, period: string): { subtotal: number; discountLabel: string | null; total: number } {
  const p = PLANS.find((x) => x.value === plan) ?? PLANS[0];
  const subtotal = period === "yearly" ? p.yearly : p.monthly;
  const discountLabel = period === "yearly" && p.monthly > 0 ? "20% off" : null;
  return { subtotal, discountLabel, total: subtotal };
}

function CouponStatus({ code, period }: { code: string; period: string }) {
  if (!code) return null;
  const validCoupons: Record<string, { pct: number; label: string }> = {
    SAVE10: { pct: 10, label: "SAVE10" },
    WELCOME20: { pct: 20, label: "WELCOME20" },
  };
  const coupon = validCoupons[code.toUpperCase()];
  if (!coupon) return <span className="text-destructive text-xxs">Invalid coupon code</span>;
  const price = calcPrice("pro", period);
  const discount = Math.round(price.subtotal * (coupon.pct / 100));
  return <span className="text-success text-xxs">{coupon.label} — ${discount} off</span>;
}

export default function BillingPage() {
  const t = useMessages("forms");
  const fieldSchemas = useMemo(() => createBillingFieldSchemas(t.billing), [t]);
  const { toast } = useToast();
  const prevPlan = useRef("pro");

  const form = useAppForm({
    ...formOptions({
      defaultValues: {
        plan: "pro",
        billingPeriod: "monthly",
        paymentMethod: "visa",
        couponCode: "",
        taxId: "",
      },
    }),
  });

  const price = useMemo(() => calcPrice(form.state.values.plan, form.state.values.billingPeriod), [form.state.values.plan, form.state.values.billingPeriod]);

  useEffect(() => {
    if (form.state.values.plan !== prevPlan.current) {
      prevPlan.current = form.state.values.plan;
      form.setFieldValue("couponCode", "");
    }
  }, [form.state.values.plan, form]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">{t.billing.heading}</h2>
        </div>
        <div className="flex items-center gap-2">
          {form.state.isDirty && <span className="text-xxs text-muted">{t.billing.unsaved}</span>}
        </div>
      </div>

      <form className="flex flex-col gap-4">
        <form.AppField name="plan" validators={{ onChange: fieldSchemas.plan }}>
          {(field) => (
            <field.RadioGroupField label={t.billing.plan} options={PLANS.map((p) => ({
              value: p.value,
              label: `${p.label} — $${p.monthly}/mo${p.yearly > 0 ? ` ($${p.yearly}/yr)` : ""}`,
            }))} />
          )}
        </form.AppField>

        <form.AppField name="billingPeriod" validators={{ onChange: fieldSchemas.billingPeriod }}>
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
          {(field) => <field.SelectField label={t.billing.paymentMethod} options={PAYMENT_METHODS} />}
        </form.AppField>

        <form.AppField name="couponCode">
          {(field) => <field.TextField label={t.billing.couponCode} placeholder={t.billing.couponPlaceholder} />}
        </form.AppField>

        <CouponStatus code={form.state.values.couponCode} period={form.state.values.billingPeriod} />

        <form.AppField name="taxId">
          {(field) => <field.TextField label={t.billing.taxId} placeholder={t.billing.taxIdPlaceholder} />}
        </form.AppField>

        <Separator />

        <div className="flex flex-col gap-1 text-xs">
          <div className="flex justify-between">
            <span>{t.billing.subtotal}</span>
            <span>${price.subtotal}</span>
          </div>
          {price.discountLabel && (
            <div className="flex justify-between text-success">
              <span>{t.billing.discount}</span>
              <span>-{price.discountLabel}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span>{t.billing.total}</span>
            <span>${price.total}</span>
          </div>
        </div>

        <Button type="submit" onClick={(e) => { e.preventDefault(); toast({ description: t.billing.saveSuccess, variant: "default" }); }}>
          {t.billing.updateButton}
        </Button>
      </form>
    </div>
  );
}
