"use client";

import { useCallback, useMemo } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm, withFieldGroup } from "@/features/forms/form-hook";
import { formOptions, useStore } from "@tanstack/react-form";
import { useToast } from "@/components/ui/Toast";
import { Separator } from "@/components/ui/Separator";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { FormLevelError } from "@/components/ui/FormLevelError";
import { checkoutSchema, createCheckoutFieldSchemas } from "@/validators/forms/checkout";
import {
  checkoutDefaultValues,
  addressDefaults,
} from "@/validators/forms/checkout-inits";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { getSurface, exceptionHandler } from "@/lib/exception-handler";
import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import { blurAsyncCheck } from "@/lib/forms/blur-async-check";
import type { ExceptionResponse } from "@/lib/api-client";
import type { z } from "zod";

const ADDRESS_OPTIONS = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "gb", label: "United Kingdom" },
  { value: "tr", label: "Turkey" },
];

const AddressGroup = withFieldGroup({
  defaultValues: addressDefaults,
  render: function AddressGroupInner({ group }) {
    const t = useMessages("forms");
    const schemas = useMemo(() => createCheckoutFieldSchemas(t.checkoutTab), [t]);
    const { simulateError } = useFormsDemoActions();
    const { toast } = useToast();
    const allMessages = useAllMessages();
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <group.AppField name="street" validators={{ onBlur: schemas.street }}>
            {(field) => <field.TextField label={t.checkoutTab.street} />}
          </group.AppField>
          <group.AppField name="city" validators={{ onBlur: schemas.city }}>
            {(field) => <field.TextField label={t.checkoutTab.city} />}
          </group.AppField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <group.AppField name="province" validators={{ onBlur: schemas.province }}>
            {(field) => <field.TextField label={t.checkoutTab.province} />}
          </group.AppField>
          <group.AppField name="postalCode" validators={{
            onBlur: schemas.postalCode,
            onBlurAsyncDebounceMs: 300,
            onBlurAsync: async ({ value }) => {
              if (value !== "00000") return undefined;
              return blurAsyncCheck(String(value), "postal-code-group", {
                simulateError, toast, allMessages,
              });
            },
          }}>
            {(field) => <field.TextField label={t.checkoutTab.postalCode} hint={t.checkoutTab.postalCodeHint} />}
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
          <group.AppField name="phone" validators={{
            onBlur: ({ value }) => {
              if (!value) return undefined;
              return /^\+?[0-9()\-.\s]{7,20}$/.test(value)
                ? undefined
                : t.checkoutTab.phoneInvalid;
            },
          }}>
            {(field) => <field.TextField label={t.checkoutTab.phone} hint={t.checkoutTab.phoneHint} />}
          </group.AppField>
        </div>
      </div>
    );
  },
});

const checkoutFormOpts = formOptions({
  defaultValues: checkoutDefaultValues satisfies z.input<typeof checkoutSchema>,
});

export async function submitCheckout(
  { value }: { value: typeof checkoutFormOpts.defaultValues },
  deps: {
    simulateError: (
      id: string,
      opts?: { failRate?: number },
    ) => Promise<ExceptionResponse>;
    toast: ReturnType<typeof useToast>["toast"];
    allMessages: Record<string, unknown>;
  },
) {
  try {
    if (value.shippingAddress.postalCode === "00000") {
      await deps.simulateError("postal-code-group", { failRate: 1 });
    } else {
      await deps.simulateError("payment-declined", { failRate: 0 });
    }
    return null;
  } catch (err) {
    const exc = (err as { exception?: ExceptionResponse }).exception;
    if (!exc) return { form: "Order failed", fields: {} };
    if (getSurface(exc.exc) === "toast") {
      deps.toast({
        description: exceptionHandler(exc, deps.allMessages),
        variant: "destructive",
      });
      return null;
    }
    return exceptionToFormErrors(exc, deps.allMessages);
  }
}

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
              {(field) => <field.TextField label={t.checkoutTab.email} />}
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
                <field.TextField label={t.checkoutTab.confirmEmail} />
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
