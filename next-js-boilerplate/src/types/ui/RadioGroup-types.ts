import type { ComponentPropsWithoutRef } from "react";
import type { Root, Item } from "@radix-ui/react-radio-group";

export type RadioGroupProps = ComponentPropsWithoutRef<typeof Root> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type RadioGroupItemProps = ComponentPropsWithoutRef<typeof Item> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type RadioGroupVariant = "default" | "shiny" | "glass" | "neon" | "gradient";
