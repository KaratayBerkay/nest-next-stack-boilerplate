"use client";

import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm } from "@/features/forms/form-hook";
import { formOptions } from "@tanstack/react-form";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import type { ReactNode } from "react";
import type { z } from "zod";
import { filtersSchema } from "@/validators/forms/filters";

function FilterSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xxs text-muted font-medium">{label}</span>
      {children}
    </div>
  );
}

const ALL_CATEGORIES = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "devops", label: "DevOps" },
  { value: "design", label: "Design" },
  { value: "data", label: "Data & ML" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "date", label: "Date" },
  { value: "name", label: "Name" },
];

const ALLOWED_SORT = ["relevance", "date", "name"];
const ALLOWED_PAGE_SIZES = ["10", "25", "50"];
const ALLOWED_STATUSES = ["", "active", "pending", "archived"];

import type { FiltersPageProps } from "@/types/forms/FiltersPage-types";

export default function FiltersPage({ initialSearchParams }: FiltersPageProps) {
  const t = useMessages("forms");
  const pathname = usePathname();
  const sp = initialSearchParams;

  const defaultValues = useMemo(() => ({
    search: (sp.search as string) ?? "",
    tags: (sp.tags as string)?.split(",").filter(Boolean) ?? [],
    sortBy: (ALLOWED_SORT.includes(sp.sortBy as string) ? (sp.sortBy as string) : "relevance") as "relevance" | "date" | "name",
    sortOrder: (sp.sortDir === "asc" ? "asc" : "desc") as "asc" | "desc",
    status: (ALLOWED_STATUSES.includes(sp.status as string) ? (sp.status as string) : "") as "" | "active" | "pending" | "archived",
    pageSize: (ALLOWED_PAGE_SIZES.includes(sp.pageSize as string) ? (sp.pageSize as string) : "25") as "10" | "25" | "50",
    category: (sp.category as string)?.split(",").filter((c) => ALL_CATEGORIES.some((cat) => cat.value === c)) ?? [],
    dateFrom: (sp.dateFrom as string) ?? "",
    dateTo: (sp.dateTo as string) ?? "",
  } satisfies z.input<typeof filtersSchema>), [sp.search, sp.tags, sp.sortBy, sp.sortDir, sp.status, sp.pageSize, sp.category, sp.dateFrom, sp.dateTo]);

  const formOpts = useMemo(() => formOptions({
    defaultValues,
    validators: {
      onChange: ({ value }) => {
        const params = new URLSearchParams();
        if (value.search) params.set("search", value.search);
        if (value.tags.length) params.set("tags", value.tags.join(","));
        if (value.sortBy !== "relevance") params.set("sortBy", value.sortBy);
        if (value.sortOrder !== "desc") params.set("sortDir", value.sortOrder);
        if (value.status) params.set("status", value.status);
        if (value.pageSize !== "25") params.set("pageSize", value.pageSize);
        if (value.category.length) params.set("category", value.category.join(","));
        if (value.dateFrom) params.set("dateFrom", value.dateFrom);
        if (value.dateTo) params.set("dateTo", value.dateTo);
        const qs = params.toString();
        const url = qs ? `${pathname}?${qs}` : pathname;
        window.history.replaceState(null, "", url);
        return undefined;
      },
    },
  }), [defaultValues, pathname]);

  const form = useAppForm(formOpts);

  const handleReset = useCallback(() => {
    form.reset();
    window.history.replaceState(null, "", pathname);
  }, [form, pathname]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.filters.heading}</h2>
      </div>

      <form className="flex flex-col gap-4">
        <form.AppField name="search">
          {(field) => <field.TextField label={t.filters.search} placeholder={t.filters.searchPlaceholder} />}
        </form.AppField>

        <form.AppField name="category">
          {(field) => <field.ComboboxField label={t.filters.category ?? "Category"} options={ALL_CATEGORIES} multiple />}
        </form.AppField>

        <form.AppField name="tags">
          {(field) => <field.ComboboxField label={t.filters.tags} options={ALL_CATEGORIES} />}
        </form.AppField>

        <div className="grid grid-cols-2 gap-4">
          <FilterSection label={t.filters.dateRange ?? "Date Range"}>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={form.state.values.dateFrom}
                onChange={(e) => form.setFieldValue("dateFrom", e.target.value)}
                className="border-border bg-bg text-fg focus-visible:ring-brand flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              />
              <input
                type="date"
                value={form.state.values.dateTo}
                onChange={(e) => form.setFieldValue("dateTo", e.target.value)}
                className="border-border bg-bg text-fg focus-visible:ring-brand flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              />
            </div>
          </FilterSection>

          <form.AppField name="sortBy">
            {(field) => <field.SelectField label={t.filters.sortBy} options={SORT_OPTIONS} />}
          </form.AppField>
        </div>

        <form.AppField name="sortOrder">
          {(field) => <field.RadioGroupField label={t.filters.sortOrder} options={[{ value: "asc", label: t.filters.asc }, { value: "desc", label: t.filters.desc }]} />}
        </form.AppField>

        <div className="grid grid-cols-2 gap-4">
          <form.AppField name="pageSize">
            {(field) => <field.SelectField label={t.filters.pageSize} options={[{ value: "10", label: "10" }, { value: "25", label: "25" }, { value: "50", label: "50" }]} />}
          </form.AppField>
          <form.AppField name="status">
            {(field) => <field.SelectField label={t.filters.status} options={[{ value: "", label: "All" }, { value: "active", label: "Active" }, { value: "pending", label: "Pending" }, { value: "archived", label: "Archived" }]} />}
          </form.AppField>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-xxs text-muted">{t.filters.results}</span>
          <Button type="button" variant="outline" size="sm" onClick={handleReset}>
            {t.filters.reset}
          </Button>
        </div>
      </form>
    </div>
  );
}
