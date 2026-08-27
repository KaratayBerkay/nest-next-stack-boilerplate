export interface FeedListProps {
  search: string;
  initialFeedData?: {
    posts: unknown[];
    hasMore: boolean;
    nextCursor: string | null;
  };
  /** When set, the reader's own posts get a crown badge (premium feed). */
  currentUserId?: string;
}
