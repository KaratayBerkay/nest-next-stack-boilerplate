import type {
  AccordionMultipleProps,
  AccordionSingleProps,
} from "@radix-ui/react-accordion";

export type AccordionProps = (AccordionSingleProps | AccordionMultipleProps) & {
  className?: string;
};
