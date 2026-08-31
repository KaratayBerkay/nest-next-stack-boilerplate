export type StickyIntroPostTitleKey =
  | "blog11Post1Title"
  | "blog11Post2Title"
  | "blog11Post3Title"
  | "blog11Post4Title"
  | "blog11Post5Title"
  | "blog11Post6Title";

export type StickyIntroPostDateKey =
  | "blog11Post1Date"
  | "blog11Post2Date"
  | "blog11Post3Date"
  | "blog11Post4Date"
  | "blog11Post5Date"
  | "blog11Post6Date";

export type Blog11CategoryKey =
  "blog11Category1" | "blog11Category2" | "blog11Category3" | "blog11Category4";

export interface StickyIntroPost {
  titleKey: StickyIntroPostTitleKey;
  dateKey: StickyIntroPostDateKey;
  seed: string;
}
