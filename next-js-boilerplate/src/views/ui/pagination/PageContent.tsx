"use client";

import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/Pagination";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const TOTAL_PAGES = 10;

function InteractivePagination({
  currentPage,
  onPageChange,
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  const pages: (number | "...")[] = [];
  if (TOTAL_PAGES <= 5) {
    for (let i = 1; i <= TOTAL_PAGES; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(TOTAL_PAGES - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < TOTAL_PAGES - 2) pages.push("...");
    pages.push(TOTAL_PAGES);
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          >
            <PaginationPrevious href="#" />
          </button>
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
                isActive={p === currentPage}
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
          <button
            type="button"
            onClick={() => onPageChange(Math.min(TOTAL_PAGES, currentPage + 1))}
            className={currentPage === TOTAL_PAGES ? "pointer-events-none opacity-50" : ""}
          >
            <PaginationNext href="#" />
          </button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function ComponentsTab() {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
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
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>
    </div>
  );
}

function ExamplesTab({
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
        <InteractivePagination currentPage={page} onPageChange={setPage} />
        <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
          <span className="text-sm">Current page: <strong>{page} of {TOTAL_PAGES}</strong></span>
          <button type="button" onClick={() => setPage(1)} className="text-muted hover:text-fg p-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </section>
    </div>
  );
}

export default function PaginationPage() {
  const [page, setPage] = useState(1);

  const examples: UIExample[] = [
    {
      id: "usage",
      title: "Search Results",
      description: "Pagination with ellipsis, sibling, and boundary counts.",
      render: () => <ComponentsTab />,
    },
    {
      id: "variants",
      title: "Compact Touch",
      description: "Mobile prev/next with page indicator.",
      render: () => <ExamplesTab page={page} setPage={setPage} />,
    },
  ];

  return (
    <ExampleTabs
      title="Pagination"
      intro="A pagination component."
      examples={examples}
    />
  );
}
