"use client";
import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";

export function PaymentMethodTab() {
  const [method, setMethod] = useState<string | undefined>();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">
        Checkout payment method with a disabled (unavailable) option.
      </p>
      <Dropdown
        aria-label="Payment method"
        options={[
          { value: "card", label: "Credit / debit card" },
          { value: "bank", label: "Bank transfer" },
          { value: "paypal", label: "PayPal" },
          { value: "crypto", label: "Crypto (coming soon)", disabled: true },
        ]}
        value={method}
        onChange={setMethod}
        placeholder="Choose payment method"
        error={method ? undefined : "A payment method is required"}
        className="max-w-sm"
      />
    </div>
  );
}
