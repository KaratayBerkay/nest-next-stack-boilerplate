import type { Icon } from "@tabler/icons-react";

export interface CaseStudiesMessages {
  [key: string]: string;
}

export interface PagesWithCaseStudiesMessages {
  caseStudies: CaseStudiesMessages;
}

export interface CaseStudy1Item {
  categoryKey: string;
  titleKey: string;
  descriptionKey: string;
  altKey: string;
  imageSeed: string;
}

export interface CaseStudy2Item {
  quoteKey: string;
  nameKey: string;
  roleKey: string;
  metricValueKey: string;
  metricLabelKey: string;
}

export interface CaseStudy3Featured {
  categoryKey: string;
  titleKey: string;
  descriptionKey: string;
  altKey: string;
  imageSeed: string;
}

export interface CaseStudy3Supporting {
  titleKey: string;
  descriptionKey: string;
  altKey: string;
  imageSeed: string;
}

export interface CaseStudy4Stat {
  valueKey: string;
  labelKey: string;
}

export interface CaseStudy5Item {
  quoteKey: string;
  nameKey: string;
  roleKey: string;
  altKey: string;
  imageSeed: string;
}

export interface CaseStudy6Item {
  titleKey: string;
  descriptionKey: string;
}

export interface CaseStudy8Item {
  categoryKey: string;
  titleKey: string;
  descriptionKey: string;
  altKey: string;
  imageSeed: string;
}

export interface CaseStudy9Item {
  categoryKey: string;
  titleKey: string;
  descriptionKey: string;
  altKey: string;
  imageSeed: string;
}

export interface CaseStudy10Item {
  categoryKey: string;
  titleKey: string;
  descriptionKey: string;
  altKey: string;
  imageSeed: string;
}

export interface CaseStudy11Item {
  categoryKey: string;
  titleKey: string;
  descriptionKey: string;
  altKey: string;
  imageSeed: string;
}

export interface CaseStudy12Item {
  categoryKey: string;
  titleKey: string;
  descriptionKey: string;
  altKey: string;
  imageSeed: string;
}

export interface CaseStudy13Card {
  valueKey: string;
  labelKey: string;
  descriptionKey: string;
  icon: Icon;
}
