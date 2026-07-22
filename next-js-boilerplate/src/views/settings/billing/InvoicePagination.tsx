"use client";

import { cn } from "@/lib/cn";

interface InvoicePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  previousLabel: string;
  nextLabel: string;
}

export function InvoicePagination({
  currentPage,
  totalPages,
  onPageChange,
  previousLabel,
  nextLabel,
}: InvoicePaginationProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="border-border hover:bg-surface-hover disabled:text-muted rounded-lg border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        {previousLabel}
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
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
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="border-border hover:bg-surface-hover disabled:text-muted rounded-lg border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        {nextLabel}
      </button>
    </div>
  );
}
