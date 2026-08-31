"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/Pagination";

export function LocalizedTab() {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Localized strings</h3>
        <p className="text-muted text-sm">
          <code>PaginationPrevious</code>/<code>PaginationNext</code> render
          custom children in place of the built-in copy, and a plain{" "}
          <code>aria-label</code> overrides the defaults.
        </p>
        <Pagination aria-label="Sayfalama">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" aria-label="Önceki sayfaya git">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Önceki
              </PaginationPrevious>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive href="#">
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" aria-label="Sonraki sayfaya git">
                Sonraki
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>
    </div>
  );
}
