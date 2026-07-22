"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BillingAddress } from "@/api/server/billing/address";

interface BillingInfoDisplayProps {
  address: BillingAddress | null;
  onEdit: () => void;
}

export function BillingInfoDisplay({ address, onEdit }: BillingInfoDisplayProps) {
  const t = useMessages("settings") as unknown as Record<string, string>;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t.billingInfo}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-brand text-xs font-medium hover:underline"
        >
          {t.editAddress}
        </button>
      </div>

      {!address ? (
        <p className="text-muted text-sm">{t.billingAddressEmpty}</p>
      ) : (
        <ul className="divide-border flex flex-col divide-y">
          {address.name && (
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted text-sm">{t.nameLabel}</span>
              <span className="text-sm font-medium">{address.name}</span>
            </li>
          )}
          {address.street && (
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted text-sm">{t.street}</span>
              <span className="text-sm font-medium">{address.street}</span>
            </li>
          )}
          {address.city && (
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted text-sm">{t.city}</span>
              <span className="text-sm font-medium">{address.city}</span>
            </li>
          )}
          {address.state && (
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted text-sm">{t.state}</span>
              <span className="text-sm font-medium">{address.state}</span>
            </li>
          )}
          {address.country && (
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted text-sm">{t.country}</span>
              <span className="text-sm font-medium">{address.country}</span>
            </li>
          )}
          {address.zipCode && (
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted text-sm">{t.zipCode}</span>
              <span className="text-sm font-medium">{address.zipCode}</span>
            </li>
          )}
          {address.vatNumber && (
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted text-sm">{t.vatNumber}</span>
              <span className="text-sm font-medium">{address.vatNumber}</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
