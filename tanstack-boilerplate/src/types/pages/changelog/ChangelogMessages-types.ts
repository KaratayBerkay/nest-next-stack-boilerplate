export interface ChangelogMessages {
  [key: string]: string;
}

export interface PagesWithChangelogMessages {
  changelog: ChangelogMessages;
}
