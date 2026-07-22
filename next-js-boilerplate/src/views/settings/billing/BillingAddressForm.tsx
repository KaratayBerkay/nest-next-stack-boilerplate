"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BillingAddressFormProps } from "@/types/billing/BillingAddressForm-types";
import type { BillingAddress } from "@/api/server/billing/address";

export function BillingAddressForm({
  address,
  onSave,
  onCancel,
  isSaving,
  className,
}: BillingAddressFormProps) {
  const t = useMessages("settings");
  const [formData, setFormData] = useState<Partial<BillingAddress>>({
    name: address?.name ?? "",
    street: address?.street ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    country: address?.country ?? "",
    zipCode: address?.zipCode ?? "",
    vatNumber: address?.vatNumber ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-4", className)}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ba-name" className="text-muted text-xs font-medium">
            Name
          </label>
          <input
            id="ba-name"
            type="text"
            value={formData.name ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
            placeholder="John Doe"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ba-zip" className="text-muted text-xs font-medium">
            Zip / Postal Code
          </label>
          <input
            id="ba-zip"
            type="text"
            value={formData.zipCode ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, zipCode: e.target.value }))
            }
            className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
            placeholder="10001"
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="ba-street" className="text-muted text-xs font-medium">
            Street
          </label>
          <input
            id="ba-street"
            type="text"
            value={formData.street ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, street: e.target.value }))
            }
            className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
            placeholder="123 Main St, Apt 4B"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ba-city" className="text-muted text-xs font-medium">
            City
          </label>
          <input
            id="ba-city"
            type="text"
            value={formData.city ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, city: e.target.value }))
            }
            className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
            placeholder="New York"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ba-state" className="text-muted text-xs font-medium">
            State
          </label>
          <input
            id="ba-state"
            type="text"
            value={formData.state ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, state: e.target.value }))
            }
            className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
            placeholder="NY"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="ba-country"
            className="text-muted text-xs font-medium"
          >
            Country
          </label>
          <input
            id="ba-country"
            type="text"
            value={formData.country ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, country: e.target.value }))
            }
            className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
            placeholder="United States"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ba-vat" className="text-muted text-xs font-medium">
            VAT Number
          </label>
          <input
            id="ba-vat"
            type="text"
            value={formData.vatNumber ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, vatNumber: e.target.value }))
            }
            className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
            placeholder="DE4920348"
          />
        </div>
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
          Cancel
        </button>
      </div>
    </form>
  );
}
