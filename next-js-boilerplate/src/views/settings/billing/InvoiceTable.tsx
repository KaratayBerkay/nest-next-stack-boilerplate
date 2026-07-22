"use client";

import { useState } from "react";
import { formatDateByPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { InvoiceTableProps } from "@/types/billing/InvoiceTable-types";
import { StatusBadge } from "./StatusBadge";
import { InvoicePagination } from "./InvoicePagination";

const PAGE_SIZE = 5;

function extractInvoiceNumber(reference: string): string {
  const match = reference.match(/#?(\d+)/);
  return match ? `#${match[1]}` : reference;
}

export function InvoiceTable({
  transactions,
  isLoading,
  className,
}: InvoiceTableProps) {
  const t = useMessages("settings");
  const dateDisplay = useDateDisplayCookie();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedTransactions = transactions.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <h3 className="text-sm font-medium">{t.invoices}</h3>
        <p className="text-muted text-sm">{t.loading}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <h3 className="text-sm font-medium">{t.invoices}</h3>
        <p className="text-muted text-sm">{t.billingHistoryEmpty}</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t.invoices}</h3>
        <p className="text-muted text-xs">
          {t.showingXofY
            .replace("{x}", String(startIndex + 1))
            .replace(
              "{y}",
              String(Math.min(startIndex + PAGE_SIZE, transactions.length)),
            )
            .replace("{z}", String(transactions.length))}
        </p>
      </div>

      <div className="border-border overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className="px-4 py-3 font-medium">
                {t.invoiceNumber.replace("{number}", "#")}
              </th>
              <th className="px-4 py-3 font-medium">
                {t.dateDisplay || "Date"}
              </th>
              <th className="px-4 py-3 font-medium">{t.price}</th>
              <th className="px-4 py-3 font-medium">{t.status || "Status"}</th>
              <th className="px-4 py-3 font-medium">{t.viewInvoice}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-border border-b last:border-b-0"
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium">
                    {extractInvoiceNumber(tx.reference)}
                  </span>
                </td>
                <td className="text-muted px-4 py-3 text-sm">
                  {formatDateByPreference(tx.createdAt, dateDisplay)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {tx.amount > 0 ? `$${(tx.amount / 100).toFixed(2)}` : "\u2014"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={tx.status}
                    paidLabel={t.paid}
                    unpaidLabel={t.unpaid}
                  />
                </td>
                <td className="px-4 py-3">
                  {tx.stripeInvoiceUrl ? (
                    <a
                      href={tx.stripeInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand text-sm font-medium hover:underline"
                    >
                      {t.viewInvoice}
                    </a>
                  ) : (
                    <span className="text-muted text-sm">\u2014</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <InvoicePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          previousLabel={t.previous}
          nextLabel={t.next}
        />
      )}
    </div>
  );
}
