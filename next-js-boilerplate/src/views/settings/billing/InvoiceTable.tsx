"use client";

import { useState } from "react";
import { formatDateByPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { cn } from "@/lib/cn";
import type { InvoiceTableProps } from "@/types/billing/InvoiceTable-types";

const PAGE_SIZE = 5;

function StatusBadge({ status }: { status: string }) {
  const isPaid = status === "COMPLETED";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        isPaid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
      )}
    >
      {isPaid ? "Paid" : "Unpaid"}
    </span>
  );
}

function extractInvoiceNumber(reference: string): string {
  const match = reference.match(/#?(\d+)/);
  return match ? `#${match[1]}` : reference;
}

export function InvoiceTable({
  transactions,
  isLoading,
  className,
}: InvoiceTableProps) {
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
        <h3 className="text-sm font-medium">Invoices</h3>
        <p className="text-muted text-sm">Loading...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <h3 className="text-sm font-medium">Invoices</h3>
        <p className="text-muted text-sm">No invoices yet.</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Invoices</h3>
        <p className="text-muted text-xs">
          Showing {startIndex + 1}–
          {Math.min(startIndex + PAGE_SIZE, transactions.length)} of{" "}
          {transactions.length}
        </p>
      </div>

      <div className="border-border overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
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
                  {tx.amount > 0 ? `$${(tx.amount / 100).toFixed(2)}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={tx.status} />
                </td>
                <td className="px-4 py-3">
                  {tx.stripeInvoiceUrl ? (
                    <a
                      href={tx.stripeInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand text-sm font-medium hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-muted text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border-border hover:bg-surface-hover disabled:text-muted rounded-lg border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium",
                page === currentPage
                  ? "bg-brand text-brand-fg"
                  : "hover:bg-surface-hover",
              )}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border-border hover:bg-surface-hover disabled:text-muted rounded-lg border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
