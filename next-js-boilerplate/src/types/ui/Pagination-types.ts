import type React from "react";

export type PaginationProps = React.ComponentPropsWithoutRef<"nav">;

export type PaginationContentProps = React.ComponentPropsWithoutRef<"ul">;

export type PaginationItemProps = React.ComponentPropsWithoutRef<"li">;

export interface PaginationLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  isActive?: boolean;
}

export type PaginationPreviousProps = React.ComponentPropsWithoutRef<"a">;

export type PaginationNextProps = React.ComponentPropsWithoutRef<"a">;

export type PaginationEllipsisProps = React.ComponentPropsWithoutRef<"span">;
