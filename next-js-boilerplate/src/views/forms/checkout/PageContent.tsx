"use client";

import { useCallback } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { formOptions } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";

const ADDRESS_OPTIONS = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "gb", label: "United Kingdom" },
  { value: "tr", label: "Turkey" },
];

const checkoutFormOpts = formOptions({
  defaultValues: {
    sameAsShipping: false,
    shippingStreet: "",
    shippingCity: "",
    shippingProvince: "",
    shippingPostalCode: "",
    shippingCountry: "us",
    shippingPhone: "",
    billingStreet: "",
    billingCity: "",
    billingProvince: "",
    billingPostalCode: "",
    billingCountry: "us",
    billingPhone: "",
    email: "",
    confirmEmail: "",
    paymentMethod: "stripe",
  },
  validators: {
    onChange: ({ value }) => {
      if (value.email && value.confirmEmail && value.email !== value.confirmEmail) {
        return { form: "Emails must match", fields: { confirmEmail: "Must match email" } as Record<string, string> };
      }
      return undefined;
    },
  },
});

export default function CheckoutPage() {
  const t = useMessages("forms");
  const { toast } = useToast();

  const form = useAppForm(checkoutFormOpts);

  const handleSameAsShipping = useCallback(() => {
    const current = form.state.values;
    const next = !current.sameAsShipping;
    form.setFieldValue("sameAsShipping", next);
    if (next) {
      form.setFieldValue("billingStreet", current.shippingStreet);
      form.setFieldValue("billingCity", current.shippingCity);
      form.setFieldValue("billingProvince", current.shippingProvince);
      form.setFieldValue("billingPostalCode", current.shippingPostalCode);
      form.setFieldValue("billingCountry", current.shippingCountry);
      form.setFieldValue("billingPhone", current.shippingPhone);
    }
  }, [form]);

  const handleSubmit = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 1500));
    toast({ description: "Order placed successfully", variant: "default" });
  }, [toast]);

  const renderAddressBlock = useCallback(
    (prefix: "shipping" | "billing", label: string) => (
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-medium">{label}</h3>
        <div className="grid grid-cols-2 gap-3">
          <form.AppField name={`${prefix}Street`}>
            {(field) => <field.TextField label="Street" />}
          </form.AppField>
          <form.AppField name={`${prefix}City`}>
            {(field) => <field.TextField label="City" />}
          </form.AppField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <form.AppField name={`${prefix}Province`}>
            {(field) => <field.TextField label="Province / State" />}
          </form.AppField>
          <form.AppField name={`${prefix}PostalCode`}>
            {(field) => <field.TextField label="Postal Code" />}
          </form.AppField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <form.AppField name={`${prefix}Country`}>
            {(field) => (
              <field.SelectField label="Country" options={ADDRESS_OPTIONS} />
            )}
          </form.AppField>
          <form.AppField name={`${prefix}Phone`}>
            {(field) => <field.TextField label="Phone" />}
          </form.AppField>
        </div>
      </div>
    ),
    [form],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.checkout.heading}</h2>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
        className="flex flex-col gap-4"
      >
        {renderAddressBlock("shipping", t.checkout.shippingAddress)}

        <Separator />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sameAsShipping"
            checked={form.state.values.sameAsShipping}
            onChange={handleSameAsShipping}
            className="h-4 w-4"
          />
          <label htmlFor="sameAsShipping" className="text-xs">{t.checkout.billingSameAsShipping}</label>
        </div>

        {!form.state.values.sameAsShipping && renderAddressBlock("billing", t.checkout.billingAddress)}

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <form.AppField name="email">
            {(field) => <field.TextField label={t.checkout.email} />}
          </form.AppField>
          <form.AppField name="confirmEmail">
            {(field) => <field.TextField label={t.checkout.confirmEmail} />}
          </form.AppField>
        </div>

        <form.AppField name="paymentMethod">
          {(field) => (
            <field.RadioGroupField label={t.checkout.paymentMethod} options={[
              { value: "stripe", label: "Credit Card (Stripe)" },
              { value: "paypal", label: "PayPal" },
            ]} />
          )}
        </form.AppField>

        <Button type="submit" onClick={handleSubmit}>{t.checkout.placeOrder}</Button>
      </form>
    </div>
  );
}
