import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/Pagination";
import type { PaginationBarProps } from "@/types/find-friends/PaginationBar-types";

export function PaginationBar({
  page,
  totalPages,
  onPageChange,
  prevLabel,
  nextLabel,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <Pagination className="pt-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={isFirst}
            className={isFirst ? "pointer-events-none opacity-30" : undefined}
            onClick={(e) => {
              e.preventDefault();
              if (!isFirst) onPageChange(page - 1);
            }}
          >
            {prevLabel}
          </PaginationPrevious>
        </PaginationItem>
        {pages.map((p, i) =>
          p === "..." ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={p === page}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(p);
                }}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={isLast}
            className={isLast ? "pointer-events-none opacity-30" : undefined}
            onClick={(e) => {
              e.preventDefault();
              if (!isLast) onPageChange(page + 1);
            }}
          >
            {nextLabel}
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
