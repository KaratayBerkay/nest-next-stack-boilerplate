export interface BlogPost {
  titleKey: string;
  dateKey: string;
  seed: string;
  categoryKey?: string;
  excerptKey?: string;
}

export interface BlogCategory {
  id: string;
  labelKey: string;
}

export type BlogMessages = Record<string, string>;

export interface BlogCardProps {
  post: BlogPost;
  t: BlogMessages;
}

export interface BlogAnimatedCardProps extends BlogCardProps {
  index: number;
}

export interface BlogSpotlightCardProps {
  post: BlogPost;
  t: BlogMessages;
}

export interface BlogLeadTileProps {
  post: BlogPost;
  lead: boolean;
  t: BlogMessages;
}
