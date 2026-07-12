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

  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="text-muted hover:bg-surface-hover rounded px-2 py-1 text-xs disabled:opacity-30"
      >
        {prevLabel}
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="text-muted px-1 text-xs">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium ${
              p === page
                ? "bg-brand text-white"
                : "text-muted hover:bg-surface-hover"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="text-muted hover:bg-surface-hover rounded px-2 py-1 text-xs disabled:opacity-30"
      >
        {nextLabel}
      </button>
    </div>
  );
}
