import type { Icon } from "@tabler/icons-react";

export interface BookADemoMessages {
  [key: string]: string;
}

export interface PagesWithBookADemoMessages {
  bookADemo: BookADemoMessages;
}

export interface BookADemo1Benefit {
  titleKey: string;
  icon: Icon;
}

export interface BookADemoLogo {
  icon: Icon;
}

export interface BookADemo2Testimonial {
  quoteKey: string;
  authorKey: string;
  roleKey: string;
  initialsKey: string;
  avatarSeed: string;
}

export interface BookADemo3Testimonial {
  quoteKey: string;
  authorKey: string;
  roleKey: string;
  initialsKey: string;
  avatarSeed: string;
}
