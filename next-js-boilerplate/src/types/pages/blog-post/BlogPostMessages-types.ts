export interface BlogPostMessages {
  [key: string]: string;
}

export interface PagesWithBlogPostMessages {
  blogPost: BlogPostMessages;
}

export type BlogPostPagesMessages = PagesWithBlogPostMessages;

export interface BlogPostTProps {
  t: BlogPostMessages;
}

export interface BlogPostNavItem {
  id: string;
  labelKey: string;
}

export interface BlogPostTableRow {
  col1Key: string;
  col2Key: string;
  col3Key: string;
}

export interface BlogPostTwoColRow {
  col1Key: string;
  col2Key: string;
}

export interface BlogPostRelatedItem {
  titleKey: string;
  categoryKey: string;
  altKey: string;
  seed: string;
}

export interface BlogPostRelatedCardProps {
  item: BlogPostRelatedItem;
  t: BlogPostMessages;
}

export interface BlogPostSection {
  headingKey: string;
  paragraphKeys: string[];
  quoteKey?: string;
}

export interface BlogPostTocItem {
  number: number;
  labelKey: string;
  paragraph1Key: string;
  paragraph2Key?: string;
  quoteKey?: string;
}
