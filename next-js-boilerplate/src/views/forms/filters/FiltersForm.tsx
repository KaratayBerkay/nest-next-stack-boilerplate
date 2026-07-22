import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { FilterSection } from "./FilterSection";
import { ALL_CATEGORIES, SORT_OPTIONS } from "./constants";
import type { useFiltersForm } from "./useFiltersForm";

type FiltersFormProps = ReturnType<typeof useFiltersForm>;

export function FiltersForm({
  form,
  dateFrom,
  dateTo,
  handleReset,
  t,
}: FiltersFormProps) {
  return (
    <form className="flex flex-col gap-4">
      <form.AppField name="search">
        {(field) => (
          <field.TextField
            label={t.filters.search}
            placeholder={t.filters.searchPlaceholder}
          />
        )}
      </form.AppField>

      <form.AppField name="category">
        {(field) => (
          <field.ComboboxField
            label={t.filters.category ?? "Category"}
            options={ALL_CATEGORIES}
            multiple
          />
        )}
      </form.AppField>

      <form.AppField name="tags">
        {(field) => (
          <field.ComboboxField
            label={t.filters.tags}
            options={ALL_CATEGORIES}
          />
        )}
      </form.AppField>

      <div className="grid grid-cols-2 gap-4">
        <FilterSection label={t.filters.dateRange ?? "Date Range"}>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => form.setFieldValue("dateFrom", e.target.value)}
              className="border-border bg-bg text-fg focus-visible:ring-brand flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => form.setFieldValue("dateTo", e.target.value)}
              className="border-border bg-bg text-fg focus-visible:ring-brand flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            />
          </div>
        </FilterSection>

        <form.AppField name="sortBy">
          {(field) => (
            <field.SelectField
              label={t.filters.sortBy}
              options={SORT_OPTIONS}
            />
          )}
        </form.AppField>
      </div>

      <form.AppField name="sortOrder">
        {(field) => (
          <field.RadioGroupField
            label={t.filters.sortOrder}
            options={[
              { value: "asc", label: t.filters.asc },
              { value: "desc", label: t.filters.desc },
            ]}
          />
        )}
      </form.AppField>

      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="pageSize">
          {(field) => (
            <field.SelectField
              label={t.filters.pageSize}
              options={[
                { value: "10", label: "10" },
                { value: "25", label: "25" },
                { value: "50", label: "50" },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="status">
          {(field) => (
            <field.SelectField
              label={t.filters.status}
              options={[
                { value: "", label: "All" },
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending" },
                { value: "archived", label: "Archived" },
              ]}
            />
          )}
        </form.AppField>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-xxs text-muted">{t.filters.results}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
        >
          {t.filters.reset}
        </Button>
      </div>
    </form>
  );
}
