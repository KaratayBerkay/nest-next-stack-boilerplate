/** Structural subset of ConversationAttachment / RoomAttachment — everything
 *  the gallery renders. The two server types differ only in fields the
 *  gallery never reads (messageId vs roomMessageId). */
export interface GalleryAttachment {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  type: string;
  name: string;
  size: number;
  createdAt: string;
}

export interface GalleryDayGroup {
  /** Stable key for the Accordion item — the group's local calendar date. */
  key: string;
  isToday: boolean;
  /** First attachment's createdAt, kept to format the non-today label lazily. */
  createdAt: string;
  attachments: GalleryAttachment[];
}

/** The i18n strings the panel needs — both the `messages` and `chat-room`
 *  namespaces carry this exact key set. */
export interface AttachmentGalleryLabels {
  allUploadsTitle: string;
  allUploadsSearchPlaceholder: string;
  allUploadsFailedToLoad: string;
  allUploadsNoResults: string;
  allUploadsEmpty: string;
  allUploadsClearFilters: string;
  today: string;
  files: string;
  loadMore: string;
}

/** Structural view of the wrapper's useInfiniteQuery result — both the
 *  conversation and room attachment queries satisfy it. */
export interface AttachmentGalleryQuery {
  data?: { pages: { attachments: GalleryAttachment[] }[] };
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
}

export interface AttachmentGalleryFiltersState {
  searchInput: string;
  setSearchInput: (value: string) => void;
  /** Debounced search plus the date range, ready to feed the query options. */
  query: { search: string; from?: Date; to?: Date };
  dateRange:
    import("@/types/ui/DateRangePicker-types").DateRangeValue | undefined;
  setDateRange: (
    value:
      import("@/types/ui/DateRangePicker-types").DateRangeValue | undefined,
  ) => void;
  hasFilters: boolean;
  clearFilters: () => void;
}

export interface AttachmentGalleryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: AttachmentGalleryLabels;
  filters: AttachmentGalleryFiltersState;
  query: AttachmentGalleryQuery;
}
