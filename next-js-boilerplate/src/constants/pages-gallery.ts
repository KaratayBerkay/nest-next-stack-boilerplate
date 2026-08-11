export interface PageExample {
  name: string;
  slug: string;
  titleKey: string;
  descKey: string;
}

export const PAGES_EXAMPLES: PageExample[] = [
  {
    name: "About",
    slug: "about",
    titleKey: "aboutTitle",
    descKey: "aboutDescription",
  },
  {
    name: "Accept Invite",
    slug: "accept-invite",
    titleKey: "acceptInviteTitle",
    descKey: "acceptInviteDescription",
  },
];
