"use client";

import { useCallback, useMemo } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm } from "@/features/forms/form-hook";
import { formOptions } from "@tanstack/react-form";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import type { ReactNode } from "react";

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

interface FiltersPageProps {
  initialSearchParams: Record<string, string | string[] | undefined>;
}

export default function FiltersPage({ initialSearchParams }: FiltersPageProps) {
  const t = useMessages("forms");

  const defaultValues = useMemo(() => ({
    search: (initialSearchParams.search as string) ?? "",
    tags: (initialSearchParams.tags as string)?.split(",").filter(Boolean) ?? [],
    sortBy: (initialSearchParams.sortBy as string) ?? "relevance",
    sortOrder: (initialSearchParams.sortDir as string) ?? "desc",
    status: (initialSearchParams.status as string) ?? "",
    pageSize: (initialSearchParams.pageSize as string) ?? "25",
  }), [initialSearchParams.search, initialSearchParams.tags, initialSearchParams.sortBy, initialSearchParams.sortDir, initialSearchParams.status, initialSearchParams.pageSize]);

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
        const qs = params.toString();
        const url = qs ? `/v1/en/forms/filters?${qs}` : "/v1/en/forms/filters";
        window.history.replaceState(null, "", url);
        return undefined;
      },
    },
  }), [defaultValues]);

  const form = useAppForm(formOpts);

  const handleReset = useCallback(() => {
    form.reset();
    window.history.replaceState(null, "", "/v1/en/forms/filters");
  }, [form]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.filters.heading}</h2>
      </div>

      <form className="flex flex-col gap-4">
        <form.AppField name="search">
          {(field) => <field.TextField label={t.filters.search} placeholder={t.filters.searchPlaceholder} />}
        </form.AppField>

        <FilterSection label={t.filters.category ?? "Category"}>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CATEGORIES.map((cat) => {
              const selected = form.state.values.tags.includes(cat.value);
              return (
                <Button
                  key={cat.value}
                  variant={selected ? "default" : "secondary"}
                  size="sm"
                  onClick={() => {
                    const next = selected
                      ? form.state.values.tags.filter((v: string) => v !== cat.value)
                      : [...form.state.values.tags, cat.value];
                    form.setFieldValue("tags", next);
                  }}
                >
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </FilterSection>

        <form.AppField name="tags">
          {(field) => <field.ComboboxField label={t.filters.tags} options={ALL_CATEGORIES} />}
        </form.AppField>

        <div className="grid grid-cols-2 gap-4">
          <FilterSection label={t.filters.dateRange ?? "Date Range"}>
            <div className="text-xxs text-muted">Mock date-range toggle — real DateRangePicker coming with a full date library integration</div>
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
