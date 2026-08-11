export type MiniPostTitleKey =
  | "blog39Mini1Title"
  | "blog39Mini2Title"
  | "blog39Mini3Title"
  | "blog39Mini4Title";

export type MiniPostDateKey =
  "blog39Mini1Date" | "blog39Mini2Date" | "blog39Mini3Date" | "blog39Mini4Date";

export interface MiniPost {
  titleKey: MiniPostTitleKey;
  dateKey: MiniPostDateKey;
  seed: string;
}
