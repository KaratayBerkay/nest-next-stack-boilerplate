"use client";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import { ProductGallery } from "@/views/ui/carousel/ProductGallery";
import { TestimonialCarousel } from "@/views/ui/carousel/TestimonialCarousel";
import { LogoCarousel } from "@/views/ui/carousel/LogoCarousel";
import { PureCssCarousel } from "@/views/ui/carousel/PureCssCarousel";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Product Gallery",
    description:
      "E-commerce product carousel with images, ratings, pricing, and add-to-cart buttons.",
    render: () => <ProductGallery />,
  },
  {
    id: "variants",
    title: "Testimonials",
    description:
      "Customer testimonial carousel with avatars, star ratings, and company roles.",
    render: () => <TestimonialCarousel />,
  },
  {
    id: "logo-strip",
    title: "Logo Strip",
    description:
      "Partner logo carousel with scroll-fade edges for landing pages.",
    render: () => <LogoCarousel />,
  },
  {
    id: "pure-css",
    title: "Pure CSS",
    description:
      "CSS scroll-snap carousel — no JS library, native browser scrolling with autoplay and mouse drag.",
    render: () => <PureCssCarousel />,
  },
];

export default function CarouselPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Carousel"
      intro="A carousel with motion and swipe."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
