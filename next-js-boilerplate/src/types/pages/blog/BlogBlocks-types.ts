export interface BlogOffsetPost {
  src: string;
  tagKey: string;
  titleKey: string;
  summaryKey: string;
  authorKey: string;
  dateKey: string;
}

export interface BlogTagListPost {
  dateKey: string;
  titleKey: string;
  summaryKey: string;
  tagsKey: string;
}

export interface BlogSquareArtPost {
  src: string;
  categoryKey: string;
  titleKey: string;
  dateKey: string;
  summaryKey: string;
}

export interface BlogAlternatingPost {
  src: string;
  badgeKey: string;
  authorKey: string;
  dateKey: string;
  titleKey: string;
  summaryKey: string;
}

export interface BlogMetadataPost {
  src: string;
  categoryKey: string;
  authorKey: string;
  dateKey: string;
  titleKey: string;
  summaryKey: string;
}

export interface BlogFeaturedPost {
  src: string;
  categoryKey: string;
  titleKey: string;
  excerptKey: string;
  authorKey: string;
  dateKey: string;
}

export interface BlogTimelinePost {
  dateKey: string;
  categoryKey: string;
  titleKey: string;
  summaryKey: string;
}
