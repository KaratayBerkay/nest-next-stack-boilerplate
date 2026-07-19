"use client";

import { useCallback } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm, withFieldGroup } from "@/features/forms/form-hook";
import { formOptions } from "@tanstack/react-form";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { checkoutSchema } from "@/validators/forms/checkout";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { getSurface, exceptionHandler } from "@/lib/exception-handler";
import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import type { ExceptionResponse } from "@/lib/api-client";
import { z } from "zod";

const ADDRESS_OPTIONS = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "gb", label: "United Kingdom" },
  { value: "tr", label: "Turkey" },
];

const ADDRESS_DEFAULTS = {
  street: "",
  city: "",
  province: "",
  postalCode: "",
  country: "us" as const,
  phone: "",
};

const AddressGroup = withFieldGroup({
  defaultValues: ADDRESS_DEFAULTS,
  render: function AddressGroupInner({ group }) {
    const t = useMessages("forms");
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <group.AppField name="street">
            {(field) => <field.TextField label={t.checkoutTab.street} />}
          </group.AppField>
          <group.AppField name="city">
            {(field) => <field.TextField label={t.checkoutTab.city} />}
          </group.AppField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <group.AppField name="province">
            {(field) => <field.TextField label={t.checkoutTab.province} />}
          </group.AppField>
          <group.AppField name="postalCode">
            {(field) => <field.TextField label={t.checkoutTab.postalCode} />}
          </group.AppField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <group.AppField
            name="country"
            listeners={{
              onChange: () => {
                group.form.setFieldValue("province", "");
              },
            }}
          >
            {(field) => (
              <field.SelectField
                label={t.checkoutTab.country}
                options={ADDRESS_OPTIONS}
              />
            )}
          </group.AppField>
          <group.AppField name="phone">
            {(field) => <field.TextField label={t.checkoutTab.phone} />}
          </group.AppField>
        </div>
      </div>
    );
  },
});

const checkoutFormOpts = formOptions({
  defaultValues: {
    shippingAddress: ADDRESS_DEFAULTS,
    billingAddress: ADDRESS_DEFAULTS,
    sameAsShipping: false,
    email: "",
    confirmEmail: "",
    paymentMethod: "stripe",
  } satisfies z.input<typeof checkoutSchema>,
});

export default function CheckoutPage() {
  const t = useMessages("forms");
  const allMessages = useAllMessages();
  const { toast } = useToast();
  const { simulateError } = useFormsDemoActions();

  const form = useAppForm({
    ...checkoutFormOpts,
    validators: {
      onChange: ({ value }) => {
        if (value.email && value.confirmEmail && value.email !== value.confirmEmail) {
          return {
            form: t.checkoutTab.emailMismatch,
            fields: { confirmEmail: t.checkoutTab.emailMismatch },
          };
        }
        return undefined;
      },
      onSubmitAsync: async ({ value }) => {
        try {
          if (value.shippingAddress.postalCode === "00000") {
            await simulateError("postal-code-group", { failRate: 1 });
          } else {
            await simulateError("payment-declined", { failRate: 0 });
          }
          return null;
        } catch (err) {
          const exc = (err as { exception?: ExceptionResponse }).exception;
          if (!exc) return { form: t.checkoutTab.orderFailed, fields: {} };
          if (getSurface(exc.exc) === "toast") {
            toast({ description: exceptionHandler(exc, allMessages), variant: "destructive" });
            return null;
          }
          return exceptionToFormErrors(exc, allMessages);
        }
      },
    },
    onSubmit: async () => {
      toast({ description: t.checkoutTab.orderPlaced, variant: "default" });
    },
  });

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

      <form.AppForm>
        <form
          onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
          className="flex flex-col gap-4"
        >
          <h3 className="text-xs font-medium">{t.checkoutTab.shippingAddress}</h3>
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
                <Label htmlFor={field.name}>{t.checkoutTab.billingSameAsShipping}</Label>
              </div>
            )}
          </form.AppField>

          {!form.state.values.sameAsShipping && (
            <>
              <Separator />
              <h3 className="text-xs font-medium">{t.checkoutTab.billingAddress}</h3>
              <AddressGroup form={form} fields="billingAddress" />
            </>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="email">
              {(field) => <field.TextField label={t.checkoutTab.email} />}
            </form.AppField>
            <form.AppField
              name="confirmEmail"
              validators={{
                onChangeListenTo: ["email"],
                onChange: ({ value, fieldApi }) => {
                  const email = fieldApi.form.getFieldValue("email");
                  if (value && email && value !== email) {
                    return t.checkoutTab.emailMismatch;
                  }
                  return undefined;
                },
              }}
            >
              {(field) => <field.TextField label={t.checkoutTab.confirmEmail} />}
            </form.AppField>
          </div>

          <form.AppField name="paymentMethod">
            {(field) => (
              <field.RadioGroupField label={t.checkoutTab.paymentMethod} options={[
                { value: "stripe", label: "Credit Card (Stripe)" },
                { value: "paypal", label: "PayPal" },
              ]} />
            )}
          </form.AppField>

          <Button type="submit">{t.checkoutTab.placeOrder}</Button>
        </form>
      </form.AppForm>
    </div>
  );
}
