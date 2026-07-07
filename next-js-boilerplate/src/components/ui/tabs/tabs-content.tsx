"use client";

import { cn } from "@/lib/cn";
import { useTabsContext } from "./tabs";

interface TabsContentProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "value"
> {
  value: string;
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const { activeValue } = useTabsContext();
  if (activeValue !== value) return null;

  return (
    <div
      role="tabpanel"
      data-state="active"
      className={cn(
        "focus-visible:ring-brand mt-2 focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
