import type { ReactNode } from "react";

export interface FeedBaseViewProps {
  renderFeedList: (search: string) => ReactNode;
  showPageInfo?: boolean;
  showSidebar?: boolean;
}
