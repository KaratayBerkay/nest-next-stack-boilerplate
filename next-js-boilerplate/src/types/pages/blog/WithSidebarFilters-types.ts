export type SidebarCategoryId =
  "all" | "design" | "engineering" | "product" | "company";

export type SidebarPostCategoryId = Exclude<SidebarCategoryId, "all">;

export type SidebarCategoryLabelKey =
  | "blog17AllCategory"
  | "blog17CategoryDesign"
  | "blog17CategoryEngineering"
  | "blog17CategoryProduct"
  | "blog17CategoryCompany";

export type SidebarPostTitleKey =
  | "blog17Post1Title"
  | "blog17Post2Title"
  | "blog17Post3Title"
  | "blog17Post4Title"
  | "blog17Post5Title"
  | "blog17Post6Title"
  | "blog17Post7Title";

export type SidebarPostExcerptKey =
  | "blog17Post1Excerpt"
  | "blog17Post2Excerpt"
  | "blog17Post3Excerpt"
  | "blog17Post4Excerpt"
  | "blog17Post5Excerpt"
  | "blog17Post6Excerpt"
  | "blog17Post7Excerpt";

export type SidebarPostAuthorKey =
  "blog17Author1" | "blog17Author2" | "blog17Author3" | "blog17Author4";

export type SidebarPostDateKey =
  | "blog17Post1Date"
  | "blog17Post2Date"
  | "blog17Post3Date"
  | "blog17Post4Date"
  | "blog17Post5Date"
  | "blog17Post6Date"
  | "blog17Post7Date";

export interface SidebarCategory {
  id: SidebarCategoryId;
  labelKey: SidebarCategoryLabelKey;
}

export interface SidebarPost {
  categoryId: SidebarPostCategoryId;
  titleKey: SidebarPostTitleKey;
  excerptKey: SidebarPostExcerptKey;
  authorKey: SidebarPostAuthorKey;
  dateKey: SidebarPostDateKey;
}
