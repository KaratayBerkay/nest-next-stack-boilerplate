"use client";

import { useMemo } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { withFieldGroup } from "@/features/forms/form-hook";
import { useToast } from "@/components/ui/Toast";
import { createCheckoutFieldSchemas } from "@/validators/forms/checkout";
import { addressDefaults } from "@/validators/forms/checkout-inits";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { blurAsyncCheck } from "@/lib/forms/blur-async-check";

export const ADDRESS_OPTIONS = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "gb", label: "United Kingdom" },
  { value: "tr", label: "Turkey" },
];

export const AddressGroup = withFieldGroup({
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
            {(field) => <field.TextField label={t.checkoutTab.street} required />}
          </group.AppField>
          <group.AppField name="city" validators={{ onBlur: schemas.city }}>
            {(field) => <field.TextField label={t.checkoutTab.city} required />}
          </group.AppField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <group.AppField name="province" validators={{ onBlur: schemas.province }}>
            {(field) => <field.TextField label={t.checkoutTab.province} required />}
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
            {(field) => <field.TextField label={t.checkoutTab.postalCode} hint={t.checkoutTab.postalCodeHint} required />}
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
