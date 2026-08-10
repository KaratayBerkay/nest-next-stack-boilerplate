import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { convertTextToDate, formatDateOnly } from "@/lib/date-time";
import { FilterSection } from "./FilterSection";
import {
  getCategoryOptions,
  getSortOptions,
  getStatusOptions,
} from "./constants";
import type { FiltersFormProps } from "@/types/views/forms/FiltersForm-types";

export function FiltersForm({
  form,
  dateFrom,
  dateTo,
  handleReset,
  t,
}: FiltersFormProps) {
  const categoryOptions = getCategoryOptions(t.filters);
  const sortOptions = getSortOptions(t.filters);
  const statusOptions = getStatusOptions(t.filters);

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
            label={t.filters.category}
            placeholder={t.filters.categoryPlaceholder}
            options={categoryOptions}
            multiple
          />
        )}
      </form.AppField>

      <form.AppField name="tags">
        {(field) => (
          <field.ComboboxField
            label={t.filters.tags}
            placeholder={t.filters.tagsPlaceholder}
            options={categoryOptions}
          />
        )}
      </form.AppField>

      <div className="grid grid-cols-2 gap-4">
        <FilterSection label={t.filters.dateRange}>
          <DateRangePicker
            value={{
              from: dateFrom
                ? (convertTextToDate(dateFrom) as Date)
                : undefined,
              to: dateTo ? (convertTextToDate(dateTo) as Date) : undefined,
            }}
            onChange={(range) => {
              form.setFieldValue(
                "dateFrom",
                range?.from ? formatDateOnly(range.from) : "",
              );
              form.setFieldValue(
                "dateTo",
                range?.to ? formatDateOnly(range.to) : "",
              );
            }}
          />
        </FilterSection>

        <form.AppField name="sortBy">
          {(field) => (
            <field.SelectField label={t.filters.sortBy} options={sortOptions} />
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
              options={statusOptions}
            />
          )}
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
  );
}
