"use client";

import { forwardRef } from "react";
import { Header, Trigger } from "@radix-ui/react-accordion";
import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";

export const AccordionTrigger = forwardRef<
  React.ElementRef<typeof Trigger>,
  React.ComponentPropsWithoutRef<typeof Trigger> & { variant?: "default" | "shiny" | "glass" | "neon" | "gradient" }
>(({ className, children, variant, value, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  const variants = {
    default: "hover:text-accent-foreground",
    shiny: "text-slate-200 hover:text-white",
    glass: "text-slate-100 hover:text-white",
    neon: "text-cyan-400 hover:text-cyan-300 group-hover:text-cyan-200",
    gradient: "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-300 hover:to-purple-300",
  };

  return (
    <Header className="flex group">
      <Trigger
        ref={ref}
        value={value}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          variants[effectiveVariant as keyof typeof variants],
          className,
        )}
        {...props}
      >
        {children}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            effectiveVariant === "neon" && "text-cyan-500 group-hover:text-cyan-400",
            effectiveVariant === "gradient" && "text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500",
          )}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Trigger>
    </Header>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";
