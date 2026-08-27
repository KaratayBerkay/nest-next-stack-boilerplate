export interface FindFriendsContentProps {
  user: { id: string };
  className?: string;
  /** Medium/Premium layout: right-hand suggested-friends panel (and no
   *  page-info button). */
  showSuggestedPanel?: boolean;
}
