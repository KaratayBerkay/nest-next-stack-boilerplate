import type React from "react";

export interface SkeletonProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: SkeletonVariant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type SkeletonVariant = "default";

export interface SkeletonLineProps extends React.ComponentPropsWithoutRef<"div"> {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export interface SkeletonMessageProps extends React.ComponentPropsWithoutRef<"div"> {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export interface SkeletonChatMessageProps extends React.ComponentPropsWithoutRef<"div"> {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export interface SkeletonConversationSidebarProps extends React.ComponentPropsWithoutRef<"div"> {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export interface SkeletonFeedListProps extends React.ComponentPropsWithoutRef<"div"> {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
