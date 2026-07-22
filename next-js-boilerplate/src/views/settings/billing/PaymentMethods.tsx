"use client";

import { useQuery } from "@tanstack/react-query";
import { paymentMethodsQueryOptions } from "@/api/client/billing/payment-methods";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PaymentMethodsProps } from "@/types/billing/PaymentMethods-types";
import type { CardIconProps } from "@/types/billing/CardIcon-types";

function CardIcon({ brand }: CardIconProps) {
  const brandLower = brand.toLowerCase();
  return (
    <div className="border-border flex h-10 w-10 items-center justify-center rounded-lg border">
      {brandLower === "visa" ? (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.428 5.384H1.572a.864.864 0 0 0-.857.74L0 18.256a.532.532 0 0 0 .516.612h3.843a.532.532 0 0 0 .515-.612l.756-5.34h5.442l.05 5.34a.532.532 0 0 0 .516.612h3.595a.532.532 0 0 0 .515-.612l.756-5.34h2.613l-.756 5.34a.532.532 0 0 0 .515.612H23.484a.532.532 0 0 0 .516-.612l1.571-12.132a.532.532 0 0 0-.516-.612l-2.627-.34z" />
        </svg>
      ) : brandLower === "mastercard" ? (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.248 16.236c.047.427.223.835.515 1.17.607.7 1.512 1.124 2.487 1.124.998 0 1.879-.39 2.52-1.063a3.63 3.63 0 0 0 1.01-1.954H9.248v-.277zm5.943 2.505a3.812 3.812 0 0 0 1.437-3.002c0-1.238-.503-2.312-1.308-3.082h-.13l1.38-4.157H14.37l-1.26 3.979H9.915v-.376H7.376v.376H5.217l-2.093-6.28H.876L.004 4.391h4.126l3.243 9.734v4.616h1.548v-4.616h4.273v4.616h2.947z" />
        </svg>
      ) : brandLower === "amex" ? (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.5 5.5h-21a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h21a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1zm-15 9H5.5V9.5h2v5zm4.5 0h-2v-5h2v5zm4.5 0h-2v-3.5h-1.5V14.5H13v-5h3.5v1.5H17V14.5h2.5v-5H21v5h-1z" />
        </svg>
      ) : (
        <svg
          className="text-muted h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
          />
        </svg>
      )}
    </div>
  );
}

export function PaymentMethods({ className }: PaymentMethodsProps) {
  const t = useMessages("settings");
  const { data: paymentMethods, isLoading } = useQuery({
    ...paymentMethodsQueryOptions(),
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <h3 className="text-sm font-medium">{t.paymentMethods}</h3>
        <p className="text-muted text-sm">{t.loading}</p>
      </div>
    );
  }

  const methods = paymentMethods ?? [];

  if (methods.length === 0) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <h3 className="text-sm font-medium">{t.paymentMethods}</h3>
        <p className="text-muted text-sm">{t.noPaymentMethods}</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h3 className="text-sm font-medium">{t.paymentMethods}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {methods.map((method) => (
          <div
            key={method.id}
            className="border-border bg-surface flex items-center gap-3 rounded-xl border p-3"
          >
            <CardIcon brand={method.brand} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium capitalize">{method.brand}</p>
                {method.isDefault && (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    {t.makeDefault}
                  </span>
                )}
              </div>
              <p className="text-muted text-xs">
                **** **** **** {method.last4}
              </p>
              <p className="text-muted text-xs">
                {t.expires || "Expires"} {method.expMonth}/{method.expYear}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
