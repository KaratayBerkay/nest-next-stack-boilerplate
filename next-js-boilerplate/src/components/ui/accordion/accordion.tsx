"use client";

import { Root } from "@radix-ui/react-accordion";
import type { AccordionProps } from "@/types/ui/Accordion-types";

export function Accordion({ className, ...props }: AccordionProps) {
  return <Root className={className} {...props} />;
}
