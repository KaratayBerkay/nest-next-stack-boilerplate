"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/Pagination";
import { Avatar } from "@/components/ui/Avatar";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { formatDate } from "@/lib/date-time";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const TOTAL_PAGES = 10;
const PAGE_SIZE = 5;

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  date: string;
}

interface Friend {
  name: string;
  initials: string;
  online: boolean;
}

const INVOICES: Invoice[] = [
  { id: "INV-0001", customer: "Alice Johnson", amount: 240.5, date: "2025-01-05" },
  { id: "INV-0002", customer: "Bob Smith", amount: 189.99, date: "2025-01-10" },
  { id: "INV-0003", customer: "Carol Davis", amount: 450, date: "2025-01-15" },
  { id: "INV-0004", customer: "David Wilson", amount: 127.3, date: "2025-01-20" },
  { id: "INV-0005", customer: "Eva Martinez", amount: 890.75, date: "2025-01-25" },
  { id: "INV-0006", customer: "Frank Brown", amount: 312.4, date: "2025-01-30" },
  { id: "INV-0007", customer: "Grace Lee", amount: 567.8, date: "2025-02-04" },
  { id: "INV-0008", customer: "Henry Taylor", amount: 234.1, date: "2025-02-09" },
  { id: "INV-0009", customer: "Ivy Chen", amount: 678.25, date: "2025-02-14" },
  { id: "INV-0010", customer: "Jack Anderson", amount: 345.6, date: "2025-02-19" },
  { id: "INV-0011", customer: "Karen White", amount: 789, date: "2025-02-24" },
  { id: "INV-0012", customer: "Leo Harris", amount: 156.75, date: "2025-03-01" },
  { id: "INV-0013", customer: "Mia Clark", amount: 423.5, date: "2025-03-06" },
  { id: "INV-0014", customer: "Noah Lewis", amount: 912.3, date: "2025-03-11" },
  { id: "INV-0015", customer: "Olivia Walker", amount: 278.9, date: "2025-03-16" },
  { id: "INV-0016", customer: "Paul Hall", amount: 634.2, date: "2025-03-21" },
  { id: "INV-0017", customer: "Quinn Young", amount: 501.45, date: "2025-03-26" },
  { id: "INV-0018", customer: "Rachel King", amount: 187.6, date: "2025-03-31" },
  { id: "INV-0019", customer: "Sam Wright", amount: 723.8, date: "2025-04-05" },
  { id: "INV-0020", customer: "Tina Scott", amount: 395.15, date: "2025-04-10" },
  { id: "INV-0021", customer: "Uma Green", amount: 268.4, date: "2025-04-15" },
  { id: "INV-0022", customer: "Victor Adams", amount: 847.55, date: "2025-04-20" },
  { id: "INV-0023", customer: "Wendy Baker", amount: 512.9, date: "2025-04-25" },
  { id: "INV-0024", customer: "Xander Hill", amount: 179.25, date: "2025-04-30" },
  { id: "INV-0025", customer: "Yara Nelson", amount: 634.7, date: "2025-05-05" },
];

const INVOICE_TOTAL = INVOICES.length;
const INVOICE_TOTAL_PAGES = Math.ceil(INVOICE_TOTAL / PAGE_SIZE);

const FRIENDS: Friend[] = [
  { name: "Alice Johnson", initials: "AJ", online: true },
  { name: "Bob Smith", initials: "BS", online: false },
  { name: "Carol Davis", initials: "CD", online: true },
  { name: "David Wilson", initials: "DW", online: true },
  { name: "Eva Martinez", initials: "EM", online: false },
  { name: "Frank Brown", initials: "FB", online: true },
  { name: "Grace Lee", initials: "GL", online: true },
  { name: "Henry Taylor", initials: "HT", online: false },
  { name: "Ivy Chen", initials: "IC", online: true },
  { name: "Jack Anderson", initials: "JA", online: true },
  { name: "Karen White", initials: "KW", online: false },
  { name: "Leo Harris", initials: "LH", online: true },
  { name: "Mia Clark", initials: "MC", online: true },
  { name: "Noah Lewis", initials: "NL", online: false },
  { name: "Olivia Walker", initials: "OW", online: true },
];

const FRIEND_GROUPS: Friend[][] = [];
for (let i = 0; i < FRIENDS.length; i += PAGE_SIZE) {
  FRIEND_GROUPS.push(FRIENDS.slice(i, i + PAGE_SIZE));
}

function buildPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  const pages: (number | "...")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }
  return pages;
}

function getPaginatedInvoices(page: number) {
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, INVOICE_TOTAL);
  return {
    items: INVOICES.slice(start, end),
    startIndex: start + 1,
    endIndex: end,
  };
}

function InteractivePagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = buildPageNumbers(currentPage, totalPages);

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
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
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
        <InteractivePagination
          currentPage={page}
          totalPages={TOTAL_PAGES}
          onPageChange={setPage}
        />
        <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
          <span className="text-sm">
            Current page: <strong>{page} of {TOTAL_PAGES}</strong>
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

function InvoiceTableTab({
  page,
  setPage,
}: {
  page: number;
  setPage: (page: number) => void;
}) {
  const { items, startIndex, endIndex } = getPaginatedInvoices(page);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface overflow-hidden rounded border border-border">
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
                <tr key={inv.id} className="border-border border-b last:border-0">
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
          Showing {startIndex}–{endIndex} of {INVOICE_TOTAL}
        </span>
      </div>
      <InteractivePagination
        currentPage={page}
        totalPages={INVOICE_TOTAL_PAGES}
        onPageChange={setPage}
      />
    </div>
  );
}

function OnlineFriendsTab({
  page,
  setPage,
}: {
  page: number;
  setPage: (page: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(
              entry.target.getAttribute("data-page-index"),
            );
            if (!isNaN(index)) {
              setPage(index);
            }
          }
        }
      },
      { root: container, threshold: 0.3 },
    );

    const sentinels = sentinelRefs.current.filter(
      Boolean,
    ) as HTMLDivElement[];
    for (const el of sentinels) observer.observe(el);

    return () => observer.disconnect();
  }, [setPage]);

  const scrollToPage = useCallback((pageIndex: number) => {
    const sentinel = sentinelRefs.current[pageIndex - 1];
    if (sentinel) {
      sentinel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="scroll-fade-y relative max-h-80 overflow-y-auto"
      >
        <div className="flex flex-col">
          {FRIEND_GROUPS.map((group, groupIndex) => {
            const pageNum = groupIndex + 1;
            return (
              <div key={pageNum}>
                <div
                  ref={(el) => {
                    sentinelRefs.current[groupIndex] = el;
                  }}
                  data-page-index={pageNum}
                />
                {group.map((friend) => (
                  <div
                    key={friend.name}
                    className="hover:bg-surface-hover flex items-center gap-3 border-border border-b px-4 py-3"
                  >
                    <Avatar
                      fallback={friend.initials}
                      size="sm"
                      status={friend.online ? "online" : undefined}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {friend.name}
                      </p>
                      <p className="text-muted flex items-center gap-1 text-xs">
                        <span
                          className={`inline-block size-1.5 rounded-full ${
                            friend.online ? "bg-success" : "bg-border"
                          }`}
                        />
                        {friend.online ? "Online" : "Offline"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="bg-brand text-brand-fg hover:opacity-90 shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-opacity"
                    >
                      Message
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: FRIEND_GROUPS.length }, (_, i) => {
          const dotPage = i + 1;
          return (
            <button
              key={dotPage}
              type="button"
              onClick={() => scrollToPage(dotPage)}
              className={`size-2 rounded-full transition-colors ${
                page === dotPage ? "bg-brand" : "bg-border"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function PaginationPage() {
  const [page, setPage] = useState(1);
  const [invoicePage, setInvoicePage] = useState(1);
  const [friendPage, setFriendPage] = useState(1);

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
    {
      id: "invoice",
      title: "Invoice Table",
      description: "Paginated invoice table with 25 mock records.",
      render: () => (
        <InvoiceTableTab page={invoicePage} setPage={setInvoicePage} />
      ),
    },
    {
      id: "friends",
      title: "Online Friends",
      description:
        "Infinite-scroll friend list with sentinel-based page detection.",
      render: () => (
        <OnlineFriendsTab page={friendPage} setPage={setFriendPage} />
      ),
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
