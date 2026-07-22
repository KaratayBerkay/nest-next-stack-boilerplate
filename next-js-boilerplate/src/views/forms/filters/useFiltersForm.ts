import { useCallback, useMemo } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm } from "@/features/forms/form-hook";
import { formOptions, useStore } from "@tanstack/react-form";
import type { z } from "zod";
import { filtersSchema } from "@/validators/forms/filters";
import {
  ALL_CATEGORIES,
  ALLOWED_SORT,
  ALLOWED_PAGE_SIZES,
  ALLOWED_STATUSES,
} from "./constants";

export function useFiltersForm(
  initialSearchParams: Record<string, string | string[] | undefined>,
  pathname: string,
) {
  const t = useMessages("forms");
  const sp = initialSearchParams;

  const defaultValues = useMemo(
    () =>
      ({
        search: (sp.search as string) ?? "",
        tags: (sp.tags as string)?.split(",").filter(Boolean) ?? [],
        sortBy: (ALLOWED_SORT.includes(sp.sortBy as string)
          ? (sp.sortBy as string)
          : "relevance") as "relevance" | "date" | "name",
        sortOrder: (sp.sortDir === "asc" ? "asc" : "desc") as "asc" | "desc",
        status: (ALLOWED_STATUSES.includes(sp.status as string)
          ? (sp.status as string)
          : "") as "" | "active" | "pending" | "archived",
        pageSize: (ALLOWED_PAGE_SIZES.includes(sp.pageSize as string)
          ? (sp.pageSize as string)
          : "25") as "10" | "25" | "50",
        category:
          (sp.category as string)
            ?.split(",")
            .filter((c) => ALL_CATEGORIES.some((cat) => cat.value === c)) ?? [],
        dateFrom: (sp.dateFrom as string) ?? "",
        dateTo: (sp.dateTo as string) ?? "",
      }) satisfies z.input<typeof filtersSchema>,
    [
      sp.search,
      sp.tags,
      sp.sortBy,
      sp.sortDir,
      sp.status,
      sp.pageSize,
      sp.category,
      sp.dateFrom,
      sp.dateTo,
    ],
  );

  const formOpts = useMemo(
    () =>
      formOptions({
        defaultValues,
        validators: {
          onChange: ({ value }) => {
            const params = new URLSearchParams();
            if (value.search) params.set("search", value.search);
            if (value.tags.length) params.set("tags", value.tags.join(","));
            if (value.sortBy !== "relevance")
              params.set("sortBy", value.sortBy);
            if (value.sortOrder !== "desc")
              params.set("sortDir", value.sortOrder);
            if (value.status) params.set("status", value.status);
            if (value.pageSize !== "25") params.set("pageSize", value.pageSize);
            if (value.category.length)
              params.set("category", value.category.join(","));
            if (value.dateFrom) params.set("dateFrom", value.dateFrom);
            if (value.dateTo) params.set("dateTo", value.dateTo);
            const qs = params.toString();
            const url = qs ? `${pathname}?${qs}` : pathname;
            window.history.replaceState(null, "", url);
            return undefined;
          },
        },
      }),
    [defaultValues, pathname],
  );

  const form = useAppForm(formOpts);

  const { dateFrom, dateTo } = useStore(form.store, (s) => ({
    dateFrom: s.values.dateFrom,
    dateTo: s.values.dateTo,
  }));

  const handleReset = useCallback(() => {
    form.reset();
    window.history.replaceState(null, "", pathname);
  }, [form, pathname]);

  return { form, dateFrom, dateTo, handleReset, t };
}
