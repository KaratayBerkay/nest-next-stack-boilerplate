export type HeroCardCategoryKey =
  "blog38Card1Category" | "blog38Card2Category" | "blog38Card3Category";

export type HeroCardTitleKey =
  "blog38Card1Title" | "blog38Card2Title" | "blog38Card3Title";

export type HeroCardExcerptKey =
  "blog38Card1Excerpt" | "blog38Card2Excerpt" | "blog38Card3Excerpt";

export type HeroCardAuthorKey =
  "blog38Card1Author" | "blog38Card2Author" | "blog38Card3Author";

export type HeroCardDateKey =
  "blog38Card1Date" | "blog38Card2Date" | "blog38Card3Date";

export interface HeroCard {
  categoryKey: HeroCardCategoryKey;
  titleKey: HeroCardTitleKey;
  excerptKey: HeroCardExcerptKey;
  authorKey: HeroCardAuthorKey;
  dateKey: HeroCardDateKey;
  seed: string;
}
