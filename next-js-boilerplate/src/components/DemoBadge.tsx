import { cn } from "@/lib";
import styles from "./DemoBadge.module.css";

/** Small pill label. Demonstrates a CSS Module composed with `cn()`. */
export function DemoBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn(styles.badge, className)}>{children}</span>;
}
