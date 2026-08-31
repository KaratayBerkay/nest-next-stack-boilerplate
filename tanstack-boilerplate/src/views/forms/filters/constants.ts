export const ALL_CATEGORIES = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "devops", label: "DevOps" },
  { value: "design", label: "Design" },
  { value: "data", label: "Data & ML" },
];

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "date", label: "Date" },
  { value: "name", label: "Name" },
];

export const ALLOWED_SORT = ["relevance", "date", "name"];
export const ALLOWED_PAGE_SIZES = ["10", "25", "50"];
export const ALLOWED_STATUSES = ["", "active", "pending", "archived"];

export function getCategoryOptions(t: Record<string, string>) {
  return [
    { value: "frontend", label: t.categoryFrontend },
    { value: "backend", label: t.categoryBackend },
    { value: "devops", label: t.categoryDevops },
    { value: "design", label: t.categoryDesign },
    { value: "data", label: t.categoryData },
  ];
}

export function getSortOptions(t: Record<string, string>) {
  return [
    { value: "relevance", label: t.sortRelevance },
    { value: "date", label: t.sortDate },
    { value: "name", label: t.sortName },
  ];
}

export function getStatusOptions(t: Record<string, string>) {
  return [
    { value: "", label: t.statusAll },
    { value: "active", label: t.statusActive },
    { value: "pending", label: t.statusPending },
    { value: "archived", label: t.statusArchived },
  ];
}
