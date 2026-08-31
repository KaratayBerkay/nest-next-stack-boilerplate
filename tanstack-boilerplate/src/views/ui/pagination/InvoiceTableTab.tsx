"use client";

import { useState } from "react";
import { Empty } from "@/components/ui/Empty";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/date-time";
import { INVOICES, PAGE_SIZE } from "./pagination-data";
import { InteractivePagination } from "./InteractivePagination";

export function InvoiceTableTab({
  page,
  setPage,
}: {
  page: number;
  setPage: (page: number) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = INVOICES.filter(
    (inv) =>
      inv.customer.toLowerCase().includes(query.toLowerCase()) ||
      inv.id.toLowerCase().includes(query.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, filtered.length);
  const items = filtered.slice(start, end);

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Filter by customer or invoice #…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        aria-label="Filter invoices"
      />
      {filtered.length === 0 ? (
        <Empty
          icon={
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
          title="No invoices found"
          description={`No invoices match "${query}". Try a different search.`}
        />
      ) : (
        <>
          <div className="bg-surface border-border overflow-hidden rounded border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border text-muted border-b text-left text-xs uppercase">
                    <th className="px-4 py-3 font-medium">Invoice #</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 text-right font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-border border-b last:border-0"
                    >
                      <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
                      <td className="px-4 py-3">{inv.customer}</td>
                      <td className="px-4 py-3 text-right">
                        ${inv.amount.toFixed(2)}
                      </td>
                      <td className="text-muted px-4 py-3 text-right text-xs">
                        {formatDate(inv.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs">
              Showing {start + 1}–{end} of {filtered.length}
            </span>
          </div>
          <InteractivePagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
