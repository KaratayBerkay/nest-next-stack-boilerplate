"use client";

import { InteractivePagination } from "./InteractivePagination";
import { TOTAL_PAGES } from "./pagination-data";

export function ExamplesTab({
  page,
  setPage,
}: {
  page: number;
  setPage: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Interactive</h3>
        <InteractivePagination
          currentPage={page}
          totalPages={TOTAL_PAGES}
          onPageChange={setPage}
        />
        <div className="bg-surface border-border flex items-center justify-between rounded border px-3 py-2">
          <span className="text-sm">
            Current page:{" "}
            <strong>
              {page} of {TOTAL_PAGES}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => setPage(1)}
            className="text-muted hover:text-fg p-0.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
}
