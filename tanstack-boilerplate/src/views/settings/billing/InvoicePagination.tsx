"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/Pagination";
import type { InvoicePaginationProps } from "@/types/views/settings/InvoicePagination-types";

export function InvoicePagination({
  currentPage,
  totalPages,
  onPageChange,
  previousLabel,
  nextLabel,
}: InvoicePaginationProps) {
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={isFirst}
            className={isFirst ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => {
              e.preventDefault();
              if (!isFirst) onPageChange(currentPage - 1);
            }}
          >
            {previousLabel}
          </PaginationPrevious>
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              isActive={page === currentPage}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page);
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={isLast}
            className={isLast ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => {
              e.preventDefault();
              if (!isLast) onPageChange(currentPage + 1);
            }}
          >
            {nextLabel}
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
