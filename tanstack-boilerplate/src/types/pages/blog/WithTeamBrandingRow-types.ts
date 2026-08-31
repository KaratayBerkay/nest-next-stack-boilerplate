import type { I18nMessages } from "@/generated/i18n-messages";

export type TeamBrandingPostBrandKey =
  | "blog16Brand1Name"
  | "blog16Brand2Name"
  | "blog16Brand3Name"
  | "blog16Brand4Name"
  | "blog16Brand5Name";

export type TeamBrandingPostCategoryKey =
  | "blog16Post1Category"
  | "blog16Post2Category"
  | "blog16Post3Category"
  | "blog16Post4Category"
  | "blog16Post5Category";

export type TeamBrandingPostTitleKey =
  | "blog16Post1Title"
  | "blog16Post2Title"
  | "blog16Post3Title"
  | "blog16Post4Title"
  | "blog16Post5Title";

export type TeamBrandingPostDescriptionKey =
  | "blog16Post1Description"
  | "blog16Post2Description"
  | "blog16Post3Description"
  | "blog16Post4Description"
  | "blog16Post5Description";

export type TeamBrandingPostDateKey =
  | "blog16Post1Date"
  | "blog16Post2Date"
  | "blog16Post3Date"
  | "blog16Post4Date"
  | "blog16Post5Date";

export interface TeamBrandingPost {
  brandKey: TeamBrandingPostBrandKey;
  mark: string;
  categoryKey: TeamBrandingPostCategoryKey;
  titleKey: TeamBrandingPostTitleKey;
  descriptionKey: TeamBrandingPostDescriptionKey;
  dateKey: TeamBrandingPostDateKey;
}

export interface BrandLockupProps {
  post: TeamBrandingPost;
  t: I18nMessages["pages"]["blog"];
}
