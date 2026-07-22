import type { Invoice, Friend } from "@/types/ui/PaginationPageContent-types";

export const TOTAL_PAGES = 10;
export const PAGE_SIZE = 5;

export const INVOICES: Invoice[] = [
  {
    id: "INV-0001",
    customer: "Alice Johnson",
    amount: 240.5,
    date: "2025-01-05",
  },
  { id: "INV-0002", customer: "Bob Smith", amount: 189.99, date: "2025-01-10" },
  { id: "INV-0003", customer: "Carol Davis", amount: 450, date: "2025-01-15" },
  {
    id: "INV-0004",
    customer: "David Wilson",
    amount: 127.3,
    date: "2025-01-20",
  },
  {
    id: "INV-0005",
    customer: "Eva Martinez",
    amount: 890.75,
    date: "2025-01-25",
  },
  {
    id: "INV-0006",
    customer: "Frank Brown",
    amount: 312.4,
    date: "2025-01-30",
  },
  { id: "INV-0007", customer: "Grace Lee", amount: 567.8, date: "2025-02-04" },
  {
    id: "INV-0008",
    customer: "Henry Taylor",
    amount: 234.1,
    date: "2025-02-09",
  },
  { id: "INV-0009", customer: "Ivy Chen", amount: 678.25, date: "2025-02-14" },
  {
    id: "INV-0010",
    customer: "Jack Anderson",
    amount: 345.6,
    date: "2025-02-19",
  },
  { id: "INV-0011", customer: "Karen White", amount: 789, date: "2025-02-24" },
  {
    id: "INV-0012",
    customer: "Leo Harris",
    amount: 156.75,
    date: "2025-03-01",
  },
  { id: "INV-0013", customer: "Mia Clark", amount: 423.5, date: "2025-03-06" },
  { id: "INV-0014", customer: "Noah Lewis", amount: 912.3, date: "2025-03-11" },
  {
    id: "INV-0015",
    customer: "Olivia Walker",
    amount: 278.9,
    date: "2025-03-16",
  },
  { id: "INV-0016", customer: "Paul Hall", amount: 634.2, date: "2025-03-21" },
  {
    id: "INV-0017",
    customer: "Quinn Young",
    amount: 501.45,
    date: "2025-03-26",
  },
  {
    id: "INV-0018",
    customer: "Rachel King",
    amount: 187.6,
    date: "2025-03-31",
  },
  { id: "INV-0019", customer: "Sam Wright", amount: 723.8, date: "2025-04-05" },
  {
    id: "INV-0020",
    customer: "Tina Scott",
    amount: 395.15,
    date: "2025-04-10",
  },
  { id: "INV-0021", customer: "Uma Green", amount: 268.4, date: "2025-04-15" },
  {
    id: "INV-0022",
    customer: "Victor Adams",
    amount: 847.55,
    date: "2025-04-20",
  },
  {
    id: "INV-0023",
    customer: "Wendy Baker",
    amount: 512.9,
    date: "2025-04-25",
  },
  {
    id: "INV-0024",
    customer: "Xander Hill",
    amount: 179.25,
    date: "2025-04-30",
  },
  {
    id: "INV-0025",
    customer: "Yara Nelson",
    amount: 634.7,
    date: "2025-05-05",
  },
];

export const FRIENDS: Friend[] = [
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

export const FRIEND_GROUPS: Friend[][] = [];
for (let i = 0; i < FRIENDS.length; i += PAGE_SIZE) {
  FRIEND_GROUPS.push(FRIENDS.slice(i, i + PAGE_SIZE));
}

export function buildPageNumbers(
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
