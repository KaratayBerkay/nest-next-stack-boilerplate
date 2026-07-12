import { cn } from "@/lib";
import styles from "./DemoBadge.module.css";
import type { DemoBadgeProps } from "@/types/components/DemoBadge-types";

/** Small pill label. Demonstrates a CSS Module composed with `cn()`. */
export function DemoBadge({ children, className }: DemoBadgeProps) {
  return <span className={cn(styles.badge, className)}>{children}</span>;
}
