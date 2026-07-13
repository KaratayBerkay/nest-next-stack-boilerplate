import type { ComponentPropsWithoutRef } from "react";
import type { Root } from "@radix-ui/react-slider";

export type SliderProps = ComponentPropsWithoutRef<typeof Root> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};
