export interface CommunityMessages {
  [key: string]: string;
}

export interface PagesWithCommunityMessages {
  community: CommunityMessages;
}
