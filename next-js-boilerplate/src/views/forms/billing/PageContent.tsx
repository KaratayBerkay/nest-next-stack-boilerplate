"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { formOptions, useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { BillingSummary } from "./BillingSummary";
import { useToast } from "@/components/ui/Toast";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { createBillingFieldSchemas } from "@/validators/forms/billing";
import { billingDefaultValues } from "@/validators/forms/billing-inits";
import { PLANS, PAYMENT_METHODS } from "./billing-constants";
import { calcPrice, validateTaxId } from "./billing-utils";
import { CouponStatus } from "./CouponStatus";
import { handleCouponBlur } from "./billing-handlers";

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
        <h2 className="text-sm font-semibold">{t.billing.heading}</h2>
        <div className="flex items-center gap-2">
          {isDirty && <span className="text-xxs text-muted">{t.billing.unsaved}</span>}
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
            onBlurAsync: async ({ value }) => handleCouponBlur(value, { simulateError, toast, allMessages }),
            onBlurAsyncDebounceMs: 300,
          }}
        >
          {(field) => (
            <field.TextField
              label={t.billing.couponCode}
              placeholder={t.billing.couponPlaceholder}
              hint={t.billing.couponHint}
            />
          )}
        </form.AppField>

        <CouponStatus code={couponCode} period={billingPeriod} t={t.billing} />

        <form.AppField
          name="taxId"
          validators={{
            onBlur: ({ value }) => validateTaxId(value, t.billing.taxIdInvalid),
          }}
        >
          {(field) => (
            <field.TextField
              label={t.billing.taxId}
              placeholder={t.billing.taxIdPlaceholder}
              hint={t.billing.taxIdHint}
            />
          )}
        </form.AppField>

        <Separator />

        <BillingSummary price={price} t={t.billing} />

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
