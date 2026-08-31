export type FeaturedSecondaryTopicTitleKey =
  | "blog22Topic1Title"
  | "blog22Topic2Title"
  | "blog22Topic3Title"
  | "blog22Topic4Title";

export type FeaturedSecondaryTopicBlurbKey =
  | "blog22Topic1Blurb"
  | "blog22Topic2Blurb"
  | "blog22Topic3Blurb"
  | "blog22Topic4Blurb";

export interface SecondaryTopic {
  titleKey: FeaturedSecondaryTopicTitleKey;
  blurbKey: FeaturedSecondaryTopicBlurbKey;
  seed: string;
}
