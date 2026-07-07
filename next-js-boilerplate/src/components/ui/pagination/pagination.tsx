import { cn } from "@/lib/cn";
import { forwardRef } from "react";

export const Pagination = forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"nav">>(({ className, ...props }, ref) => <nav ref={ref} role="navigation" aria-label="pagination" className={cn("mx-auto flex w-full justify-center", className)} {...props} />);
Pagination.displayName = "Pagination";

export const PaginationContent = forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<"ul">>(({ className, ...props }, ref) => <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />);
PaginationContent.displayName = "PaginationContent";

export const PaginationItem = forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(({ className, ...props }, ref) => <li ref={ref} className={cn(className)} {...props} />);
PaginationItem.displayName = "PaginationItem";

export const PaginationLink = forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<"a"> & { isActive?: boolean }>(({ className, isActive, ...props }, ref) => <a ref={ref} aria-current={isActive ? "page" : undefined} className={cn("border-border hover:bg-surface-hover inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm transition-colors", isActive && "bg-surface border-fg pointer-events-none", className)} {...props} />);
PaginationLink.displayName = "PaginationLink";

export const PaginationPrevious = forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<"a">>(({ className, ...props }, ref) => <a ref={ref} aria-label="Go to previous page" className={cn("hover:bg-surface-hover inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors", className)} {...props}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>Previous</a>);
PaginationPrevious.displayName = "PaginationPrevious";

export const PaginationNext = forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<"a">>(({ className, ...props }, ref) => <a ref={ref} aria-label="Go to next page" className={cn("hover:bg-surface-hover inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors", className)} {...props}>Next<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg></a>);
PaginationNext.displayName = "PaginationNext";

export const PaginationEllipsis = forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(({ className, ...props }, ref) => <span ref={ref} aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg><span className="sr-only">More pages</span></span>);
PaginationEllipsis.displayName = "PaginationEllipsis";
