"use client";

import { useState } from "react";
import { formatDateByPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { cn } from "@/lib/cn";
import { formatCurrency, toCurrencyCode } from "@/lib/currency";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { tierLabel } from "@/lib/tier";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import type { InvoiceTableProps } from "@/types/billing/InvoiceTable-types";
import { StatusBadge } from "./StatusBadge";
import { InvoicePagination } from "./InvoicePagination";

const PAGE_SIZE = 5;

// Every transaction's `reference` the backend actually writes is
// `subscription:${TIER}` (see billing.service.ts / stripe-webhook.controller.ts)
// — there's no real sequential invoice-number concept in this data model, so
// this describes what the charge was for instead of pretending otherwise.
function describeInvoice(reference: string, fallback: string): string {
  const match = reference.match(/^subscription:([A-Z]+)$/);
  return match ? tierLabel(match[1]) : fallback;
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.invoiceDescription}</TableHead>
            <TableHead>{t.date}</TableHead>
            <TableHead>{t.price}</TableHead>
            <TableHead>{t.status || "Status"}</TableHead>
            <TableHead>{t.viewInvoice}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedTransactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="font-medium">
                {describeInvoice(tx.reference, tx.reference)}
              </TableCell>
              <TableCell className="text-muted">
                {formatDateByPreference(tx.createdAt, dateDisplay)}
              </TableCell>
              <TableCell>
                {tx.amount > 0
                  ? formatCurrency(tx.amount, toCurrencyCode(tx.currency))
                  : "\u2014"}
              </TableCell>
              <TableCell>
                <StatusBadge
                  status={tx.status}
                  paidLabel={t.paid}
                  unpaidLabel={t.unpaid}
                />
              </TableCell>
              <TableCell>
                {tx.stripeInvoiceUrl ? (
                  <Button variant="link" size="xs" asChild>
                    <a
                      href={tx.stripeInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.viewInvoice}
                    </a>
                  </Button>
                ) : (
                  <span className="text-muted text-sm">{"\u2014"}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
