export type MagazineLatestTitleKey =
  | "blog26Latest1Title"
  | "blog26Latest2Title"
  | "blog26Latest3Title"
  | "blog26Latest4Title";

export type MagazineLatestAuthorKey =
  | "blog26Latest1Author"
  | "blog26Latest2Author"
  | "blog26Latest3Author"
  | "blog26Latest4Author";

export type MagazineLatestDateKey =
  | "blog26Latest1Date"
  | "blog26Latest2Date"
  | "blog26Latest3Date"
  | "blog26Latest4Date";

export interface MagazineLatestPost {
  titleKey: MagazineLatestTitleKey;
  authorKey: MagazineLatestAuthorKey;
  dateKey: MagazineLatestDateKey;
}
