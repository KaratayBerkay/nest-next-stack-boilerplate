"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BillingAddressFormProps } from "@/types/billing/BillingAddressForm-types";
import type { BillingAddress } from "@/api/server/billing/address";
import { BillingAddressField } from "./BillingAddressField";

function handleFormSubmit(
  e: React.FormEvent,
  formData: Partial<BillingAddress>,
  onSave: (data: Partial<BillingAddress>) => void,
) {
  e.preventDefault();
  onSave(formData);
}

export function BillingAddressForm({
  address,
  onSave,
  onCancel,
  isSaving,
  className,
}: BillingAddressFormProps) {
  const t = useMessages("settings") as unknown as Record<string, string>;
  const [formData, setFormData] = useState<Partial<BillingAddress>>({
    name: address?.name ?? "",
    street: address?.street ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    country: address?.country ?? "",
    zipCode: address?.zipCode ?? "",
    vatNumber: address?.vatNumber ?? "",
  });

  const setField = (field: string) => (value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <form
      onSubmit={(e) => handleFormSubmit(e, formData, onSave)}
      className={cn("flex flex-col gap-4", className)}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BillingAddressField
          id="ba-name"
          label={t.nameLabel}
          value={formData.name ?? ""}
          onChange={setField("name")}
          placeholder="John Doe"
        />
        <BillingAddressField
          id="ba-zip"
          label={t.zipCode}
          value={formData.zipCode ?? ""}
          onChange={setField("zipCode")}
          placeholder="10001"
        />
        <BillingAddressField
          id="ba-street"
          label={t.street}
          value={formData.street ?? ""}
          onChange={setField("street")}
          placeholder="123 Main St, Apt 4B"
          spanCol2
        />
        <BillingAddressField
          id="ba-city"
          label={t.city}
          value={formData.city ?? ""}
          onChange={setField("city")}
          placeholder="New York"
        />
        <BillingAddressField
          id="ba-state"
          label={t.state}
          value={formData.state ?? ""}
          onChange={setField("state")}
          placeholder="NY"
        />
        <BillingAddressField
          id="ba-country"
          label={t.country}
          value={formData.country ?? ""}
          onChange={setField("country")}
          placeholder="United States"
        />
        <BillingAddressField
          id="ba-vat"
          label={t.vatNumber}
          value={formData.vatNumber ?? ""}
          onChange={setField("vatNumber")}
          placeholder="DE4920348"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-brand text-brand-fg rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? t.saving : t.save}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border-border hover:bg-surface-hover rounded-lg border px-4 py-2 text-sm font-medium"
        >
          {t.cancelSubscription || "Cancel"}
        </button>
      </div>
    </form>
  );
}
