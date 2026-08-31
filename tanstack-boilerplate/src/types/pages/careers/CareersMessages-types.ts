import type { Icon } from "@tabler/icons-react";

export interface CareersMessages {
  [key: string]: string;
}

export interface PagesWithCareersMessages {
  careers: CareersMessages;
}

export interface Careers1Job {
  titleKey: string;
  locationKey: string;
}

export interface Careers1Department {
  titleKey: string;
  jobs: Careers1Job[];
}

export interface Careers2Job {
  titleKey: string;
  typeKey: string;
  cityKey: string;
  remoteKey: string;
}

export interface Careers3Job {
  titleKey: string;
  descriptionKey: string;
  locationKey: string;
}

export interface Careers3Category {
  titleKey: string;
  jobs: Careers3Job[];
}

export interface Careers4Job {
  titleKey: string;
  locationKey: string;
}

export interface Careers4Category {
  titleKey: string;
  jobs: Careers4Job[];
}

export interface Careers5Job {
  titleKey: string;
  descriptionKey: string;
  locationKey: string;
  salaryKey: string;
}

export interface Careers6Stat {
  labelKey: string;
  icon: Icon;
}

export interface Careers6Job {
  titleKey: string;
  descriptionKey: string;
  departmentKey: string;
  locationKey: string;
  scheduleKey: string;
  compensationKey: string;
  experienceKey: string;
}

export interface Careers7Job {
  titleKey: string;
  locationKey: string;
}

export interface Careers7Category {
  titleKey: string;
  jobs: Careers7Job[];
}

export interface Careers8Job {
  titleKey: string;
  locationKey: string;
}

export interface Careers8Category {
  titleKey: string;
  jobs: Careers8Job[];
}

export interface Careers9Job {
  categoryKey: string;
  titleKey: string;
  locationKey: string;
}
