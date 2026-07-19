"use client";

import { useCallback } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm } from "@/features/forms/form-hook";
import { formOptions } from "@tanstack/react-form";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";

const ADDRESS_OPTIONS = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "gb", label: "United Kingdom" },
  { value: "tr", label: "Turkey" },
];

interface AddressFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  prefix: "shippingAddress" | "billingAddress";
}

function AddressFields({ form, prefix }: AddressFieldsProps) {
  const t = useMessages("forms");

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <form.AppField name={`${prefix}.street`}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => <field.TextField label={t.checkoutTab.street} />}
        </form.AppField>
        <form.AppField name={`${prefix}.city`}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => <field.TextField label={t.checkoutTab.city} />}
        </form.AppField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <form.AppField name={`${prefix}.province`}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => <field.TextField label={t.checkoutTab.province} />}
        </form.AppField>
        <form.AppField name={`${prefix}.postalCode`}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => <field.TextField label={t.checkoutTab.postalCode} />}
        </form.AppField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <form.AppField name={`${prefix}.country`}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
            <field.SelectField label={t.checkoutTab.country} options={ADDRESS_OPTIONS} />
          )}
        </form.AppField>
        <form.AppField name={`${prefix}.phone`}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => <field.TextField label={t.checkoutTab.phone} />}
        </form.AppField>
      </div>
    </div>
  );
}

const checkoutFormOpts = formOptions({
  defaultValues: {
    shippingAddress: { street: "", city: "", province: "", postalCode: "", country: "us", phone: "" },
    billingAddress: { street: "", city: "", province: "", postalCode: "", country: "us", phone: "" },
    sameAsShipping: false,
    email: "",
    confirmEmail: "",
    paymentMethod: "stripe",
  },
  validators: {
    onChange: ({ value }) => {
      if (value.email && value.confirmEmail && value.email !== value.confirmEmail) {
        return { form: "Emails must match", fields: { confirmEmail: "Must match email" } };
      }
      return undefined;
    },
  },
});

export default function CheckoutPage() {
  const t = useMessages("forms");
  const { toast } = useToast();

  const form = useAppForm(checkoutFormOpts);

  const handleToggleSame = useCallback(() => {
    const next = !form.state.values.sameAsShipping;
    form.setFieldValue("sameAsShipping", next);
    if (next) {
      const sa = form.state.values.shippingAddress;
      form.setFieldValue("billingAddress", { ...sa });
    }
  }, [form]);

  const handleSubmit = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 1500));
    toast({ description: t.checkoutTab.orderPlaced, variant: "default" });
  }, [toast, t]);

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
          <AddressFields form={form} prefix="shippingAddress" />

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
              <AddressFields form={form} prefix="billingAddress" />
            </>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="email">
              {(field) => <field.TextField label={t.checkoutTab.email} />}
            </form.AppField>
            <form.AppField name="confirmEmail">
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

          <Button type="submit" onClick={handleSubmit}>{t.checkoutTab.placeOrder}</Button>
        </form>
      </form.AppForm>
    </div>
  );
}
