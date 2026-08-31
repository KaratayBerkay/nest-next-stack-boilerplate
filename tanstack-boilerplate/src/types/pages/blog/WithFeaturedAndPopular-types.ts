export type PopularPostTitleKey =
  | "blog14Popular1Title"
  | "blog14Popular2Title"
  | "blog14Popular3Title"
  | "blog14Popular4Title";

export type PopularPostDateKey =
  | "blog14Popular1Date"
  | "blog14Popular2Date"
  | "blog14Popular3Date"
  | "blog14Popular4Date";

export interface PopularPost {
  titleKey: PopularPostTitleKey;
  dateKey: PopularPostDateKey;
  seed: string;
}
