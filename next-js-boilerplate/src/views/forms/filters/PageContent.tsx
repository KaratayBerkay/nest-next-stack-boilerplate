"use client";

import { usePathname } from "next/navigation";
import type { FiltersPageProps } from "@/types/forms/FiltersPage-types";
import { useFiltersForm } from "./useFiltersForm";
import { FiltersForm } from "./FiltersForm";

export default function FiltersPage({ initialSearchParams }: FiltersPageProps) {
  const pathname = usePathname();
  const { form, dateFrom, dateTo, handleReset, t } = useFiltersForm(
    initialSearchParams,
    pathname,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.filters.heading}</h2>
      </div>

      <FiltersForm
        form={form}
        dateFrom={dateFrom}
        dateTo={dateTo}
        handleReset={handleReset}
        t={t}
      />
    </div>
  );
}
