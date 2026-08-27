"use client";

import { useMemo, useState } from "react";
import {
  IconChevronDown,
  IconFolderOpen,
  IconSearch,
} from "@tabler/icons-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Skeleton } from "@/components/ui/skeleton";
import { AttachmentPreview } from "@/components/AttachmentPreview";
import { groupAttachmentsByDay } from "@/components/AttachmentGalleryPanel-utils";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { useDebounce } from "@/hooks/ui/useDebounce";
import {
  formatDateByPreference,
  formatDateTimeByPreference,
} from "@/lib/date-time";
import type {
  AttachmentGalleryFiltersState,
  AttachmentGalleryPanelProps,
} from "@/types/components/AttachmentGalleryPanel-types";
import type { DateRangeValue } from "@/types/ui/DateRangePicker-types";

/** Search + date-range filter state for the gallery — owned by the wrapper
 *  (it feeds the wrapper's own attachment query) and rendered by the panel. */
export function useAttachmentGalleryFilters(): AttachmentGalleryFiltersState {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 300);
  const [dateRange, setDateRange] = useState<DateRangeValue | undefined>();
  const hasFilters = !!search.trim() || !!dateRange?.from;

  return {
    searchInput,
    setSearchInput,
    query: { search, from: dateRange?.from, to: dateRange?.to },
    dateRange,
    setDateRange,
    hasFilters,
    clearFilters: () => {
      setSearchInput("");
      setDateRange(undefined);
    },
  };
}

/**
 * The all-uploads gallery sheet shared by the DM chat and the chat rooms —
 * the two features previously carried structurally identical 210-line
 * copies differing only in query options and message namespace. Wrappers
 * (AttachmentGallerySheet / RoomAttachmentGallerySheet) own their own
 * attachment query and pass its result plus their namespace's labels.
 */
export function AttachmentGalleryPanel({
  open,
  onOpenChange,
  labels: t,
  filters,
  query,
}: AttachmentGalleryPanelProps) {
  const dateDisplay = useDateDisplayCookie();
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage } = query;

  // Pages are already newest-first (see the wrappers' query options) —
  // flatten in fetch order, do not reverse.
  const attachments = useMemo(
    () => data?.pages.flatMap((p) => p.attachments) ?? [],
    [data],
  );
  const dayGroups = useMemo(
    () => groupAttachmentsByDay(attachments),
    [attachments],
  );
  // Uncontrolled: only computed once, at the moment the Accordion below first
  // mounts with real data (Sheet content unmounts on close, so this is fresh
  // on every open) — today's group starts open, everything else collapsed.
  const defaultOpenGroups = useMemo(
    () => dayGroups.filter((g) => g.isToday).map((g) => g.key),
    [dayGroups],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-3/4 flex-col lg:max-w-3xl">
        <SheetHeader>
          <SheetTitle>{t.allUploadsTitle}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-wrap items-center gap-2 py-3">
          <div className="relative min-w-[10rem] flex-1">
            <IconSearch
              size={14}
              stroke={1.5}
              className="text-muted pointer-events-none absolute top-1/2 left-2.5 z-10 -translate-y-1/2"
            />
            <Input
              type="text"
              value={filters.searchInput}
              onChange={(e) => filters.setSearchInput(e.target.value)}
              placeholder={t.allUploadsSearchPlaceholder}
              className="w-full pl-8 text-sm"
            />
          </div>
          <DateRangePicker
            value={filters.dateRange}
            onChange={filters.setDateRange}
            className="w-64"
          />
        </div>

        <div className="-mx-6 flex-1 overflow-y-auto px-6">
          {isLoading ? (
            <div className="flex flex-col gap-3 py-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-error py-8 text-center text-sm">
              {t.allUploadsFailedToLoad}
            </p>
          ) : dayGroups.length === 0 ? (
            <div className="text-muted flex flex-col items-center gap-3 py-12 text-center">
              <IconFolderOpen size={40} />
              <span className="text-sm">
                {filters.hasFilters ? t.allUploadsNoResults : t.allUploadsEmpty}
              </span>
              {filters.hasFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={filters.clearFilters}
                >
                  {t.allUploadsClearFilters}
                </Button>
              ) : null}
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={defaultOpenGroups}>
              {dayGroups.map((group) => (
                <AccordionItem key={group.key} value={group.key}>
                  <AccordionTrigger className="group">
                    <span className="flex items-center gap-2">
                      <IconChevronDown
                        size={16}
                        className="text-muted shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                      />
                      {group.isToday
                        ? t.today
                        : formatDateByPreference(group.createdAt, dateDisplay)}
                    </span>
                    <span className="text-muted text-xs font-normal">
                      {group.attachments.length} {t.files}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="flex flex-col gap-2">
                      {group.attachments.map((att) => (
                        <li
                          key={att.id}
                          className="flex items-center justify-between gap-3"
                        >
                          <AttachmentPreview
                            url={att.url}
                            type={att.type}
                            name={att.name}
                            size={att.size}
                            thumbnailUrl={att.thumbnailUrl}
                            className="flex-1"
                          />
                          <span className="text-muted shrink-0 text-[11px]">
                            {formatDateTimeByPreference(
                              att.createdAt,
                              dateDisplay,
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {hasNextPage ? (
            <div className="flex justify-center py-3">
              <Button
                variant="outline"
                size="sm"
                disabled={isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
              >
                {t.loadMore}
              </Button>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
