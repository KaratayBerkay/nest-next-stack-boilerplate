export interface FeedListProps {
  search: string;
  initialFeedData?: {
    posts: unknown[];
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export interface FeedListPremiumProps {
  search: string;
  initialFeedData?: {
    posts: unknown[];
    hasMore: boolean;
    nextCursor: string | null;
  };
  currentUserId?: string;
}
