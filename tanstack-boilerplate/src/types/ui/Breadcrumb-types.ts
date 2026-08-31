import type React from "react";

export interface BreadcrumbProps {
  children: React.ReactNode;
  className?: string;
}

export type BreadcrumbListProps = React.ComponentPropsWithoutRef<"ol">;

export type BreadcrumbItemProps = React.ComponentPropsWithoutRef<"li">;

export interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  asChild?: boolean;
}

export type BreadcrumbPageProps = React.ComponentPropsWithoutRef<"span">;

export interface BreadcrumbSeparatorProps {
  children?: React.ReactNode;
  className?: string;
}

export interface BreadcrumbEllipsisProps {
  children?: React.ReactNode;
  className?: string;
}
