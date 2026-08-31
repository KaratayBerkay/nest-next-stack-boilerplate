import type React from "react";
import type useEmblaCarousel from "embla-carousel-react";

export interface CarouselProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onSelect"
> {
  opts?: Parameters<typeof useEmblaCarousel>[0];
  onSelect?: (index: number) => void;
}

export interface CarouselContentProps extends React.ComponentPropsWithoutRef<"div"> {
  containerClassName?: string;
}

export type CarouselItemProps = React.ComponentPropsWithoutRef<"div">;

export type CarouselPreviousProps = React.ComponentPropsWithoutRef<"button">;

export type CarouselNextProps = React.ComponentPropsWithoutRef<"button">;
