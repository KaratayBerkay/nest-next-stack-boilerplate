"use client";

import { useCallback } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm } from "@/features/forms/form-hook";
import { useStore } from "@tanstack/react-form";
import { useToast } from "@/components/ui/Toast";
import { Separator } from "@/components/ui/Separator";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { FormLevelError } from "@/components/ui/FormLevelError";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { AddressGroup } from "@/views/forms/checkout/AddressGroup";
import {
  checkoutFormOpts,
  submitCheckout,
} from "@/views/forms/checkout/submitCheckout";

export { submitCheckout };

export default function CheckoutPage() {
  const t = useMessages("forms");
  const allMessages = useAllMessages();
  const { toast } = useToast();
  const { simulateError } = useFormsDemoActions();

  const form = useAppForm({
    ...checkoutFormOpts,
    validators: {
      onSubmitAsync: ({ value }) =>
        submitCheckout({ value }, { simulateError, toast, allMessages }),
    },
    onSubmit: async () => {
      toast({ description: t.checkoutTab.orderPlaced, variant: "default" });
    },
  });

  const sameAsShipping = useStore(form.store, (s) => s.values.sameAsShipping);

  const handleToggleSame = useCallback(() => {
    const next = !form.state.values.sameAsShipping;
    form.setFieldValue("sameAsShipping", next as false);
    if (next) {
      const sa = form.state.values.shippingAddress;
      form.setFieldValue("billingAddress", { ...sa });
    }
  }, [form]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.checkoutTab.heading}</h2>
      </div>

      <FormLevelError form={form} />

      <form.AppForm>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <h3 className="text-xs font-medium">
            {t.checkoutTab.shippingAddress}
          </h3>
          <AddressGroup form={form} fields="shippingAddress" />

          <Separator />

          <form.AppField name="sameAsShipping">
            {(field) => (
              <div className="flex items-center gap-2">
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onChange={handleToggleSame}
                />
                <Label htmlFor={field.name}>
                  {t.checkoutTab.billingSameAsShipping}
                </Label>
              </div>
            )}
          </form.AppField>

          {!sameAsShipping && (
            <>
              <Separator />
              <h3 className="text-xs font-medium">
                {t.checkoutTab.billingAddress}
              </h3>
              <AddressGroup form={form} fields="billingAddress" />
            </>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="email">
              {(field) => <field.TextField label={t.checkoutTab.email} required />}
            </form.AppField>
            <form.AppField
              name="confirmEmail"
              validators={{
                onBlurListenTo: ["email"],
                onBlur: ({ value, fieldApi }) => {
                  const email = fieldApi.form.getFieldValue("email");
                  if (value && email && value !== email) {
                    return t.checkoutTab.emailMismatch;
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <field.TextField label={t.checkoutTab.confirmEmail} required />
              )}
            </form.AppField>
          </div>

          <form.AppField name="paymentMethod">
            {(field) => (
              <field.RadioGroupField
                label={t.checkoutTab.paymentMethod}
                options={[
                  { value: "stripe", label: "Credit Card (Stripe)" },
                  { value: "paypal", label: "PayPal" },
                ]}
              />
            )}
          </form.AppField>

          <form.SubmitButton
            label={t.checkoutTab.placeOrder}
            loadingLabel={t.checkoutTab.placing}
          />
        </form>
      </form.AppForm>
    </div>
  );
}
