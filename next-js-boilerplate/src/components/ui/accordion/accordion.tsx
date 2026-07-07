"use client";

import {
  Root,
  type AccordionMultipleProps,
  type AccordionSingleProps,
} from "@radix-ui/react-accordion";

type AccordionProps = (AccordionSingleProps | AccordionMultipleProps) & {
  className?: string;
};

export function Accordion({ className, ...props }: AccordionProps) {
  return <Root className={className} {...props} />;
}
