import type React from "react";

export interface SkeletonLineProps extends React.ComponentPropsWithoutRef<"div"> {
  width?: string;
}

export type SkeletonMessageProps = React.ComponentPropsWithoutRef<"div">;

export interface SkeletonChatMessageProps extends React.ComponentPropsWithoutRef<"div"> {
  isMe?: boolean;
}

export type SkeletonConversationSidebarProps =
  React.ComponentPropsWithoutRef<"div">;

export type SkeletonFeedListProps = React.ComponentPropsWithoutRef<"div">;

export interface EmojiPickerInlineProps {
  onEmojiSelect: (emoji: string) => void;
}
