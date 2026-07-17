"use client";
import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/Carousel";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const products = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    price: 349,
    originalPrice: 449,
    rating: 4.8,
    reviews: 2341,
    image: "from-slate-800 to-slate-900",
    badge: "Best Seller",
    badgeVariant: "success" as const,
  },
  {
    name: "Ultra-Slim Mechanical Keyboard",
    price: 189,
    originalPrice: null,
    rating: 4.6,
    reviews: 876,
    image: "from-zinc-700 to-zinc-800",
    badge: null,
    badgeVariant: "default" as const,
  },
  {
    name: "Ergonomic Vertical Mouse",
    price: 79,
    originalPrice: 99,
    rating: 4.4,
    reviews: 1203,
    image: "from-gray-600 to-gray-700",
    badge: "-20%",
    badgeVariant: "error" as const,
  },
  {
    name: "4K Webcam with Ring Light",
    price: 129,
    originalPrice: null,
    rating: 4.7,
    reviews: 543,
    image: "from-neutral-600 to-neutral-700",
    badge: "New",
    badgeVariant: "info" as const,
  },
  {
    name: "USB-C Docking Station Hub",
    price: 159,
    originalPrice: 199,
    rating: 4.5,
    reviews: 412,
    image: "from-stone-600 to-stone-700",
    badge: "-20%",
    badgeVariant: "error" as const,
  },
  {
    name: "Studio Monitor Speakers (Pair)",
    price: 499,
    originalPrice: null,
    rating: 4.9,
    reviews: 678,
    image: "from-slate-700 to-slate-800",
    badge: "Pro",
    badgeVariant: "success" as const,
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < Math.round(rating) ? "fill-amber-400" : "fill-muted",
          )}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Dots({ total, active }: { total: number; active: number }) {
  return (
    <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full transition-all duration-300",
            i === active ? "size-1.5 bg-fg w-4" : "size-1.5 bg-fg/40",
          )}
        />
      ))}
    </div>
  );
}

function ProductGallery() {
  const [activeIndex] = useState(0);

  return (
    <Carousel className="relative w-full" opts={{ startIndex: 0, loop: true }}>
      <div className="relative overflow-hidden rounded-xl">
        <CarouselContent>
          {products.map((product, i) => (
            <CarouselItem key={i}>
              <div className="group relative bg-surface rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div
                    className={cn(
                      "h-full w-full bg-gradient-to-br transition-transform duration-500 group-hover:scale-105",
                      product.image,
                    )}
                  />
                  {product.badge && (
                    <Badge
                      variant={product.badgeVariant}
                      className="absolute top-3 left-3"
                    >
                      {product.badge}
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm leading-tight mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Stars rating={product.rating} />
                    <span className="text-muted text-xs">
                      {product.rating} ({product.reviews.toLocaleString()})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-muted text-sm line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                  <Button className="mt-3 w-full" size="sm">
                    Add to Cart
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <Dots total={products.length} active={activeIndex} />
      </div>
    </Carousel>
  );
}

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Head of Design, Figma",
    text: "This component library has completely transformed our design-to-development workflow. The consistency across all components is remarkable.",
    avatar: "SC",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO, Vercel",
    text: "The best UI toolkit we've used. It integrates seamlessly with Next.js and the accessibility features are first-class. Highly recommended.",
    avatar: "MR",
    rating: 5,
  },
  {
    name: "Aisha Patel",
    role: "Frontend Lead, Stripe",
    text: "We migrated our entire dashboard to this library in under a week. The component API is intuitive and the theming system is incredibly flexible.",
    avatar: "AP",
    rating: 5,
  },
  {
    name: "James O'Connor",
    role: "Product Engineer, Linear",
    text: "Finally a component library that doesn't fight you. Every component just works exactly as you'd expect. The TypeScript support is exceptional.",
    avatar: "JO",
    rating: 4,
  },
  {
    name: "Yuki Tanaka",
    role: "Senior Developer, Notion",
    text: "Outstanding build quality and attention to detail. The dark mode support is perfect and the performance is noticeably better than alternatives.",
    avatar: "YT",
    rating: 5,
  },
];

function TestimonialCarousel() {
  const [activeIndex] = useState(0);

  return (
    <Carousel className="relative w-full" opts={{ startIndex: 0, loop: true }}>
      <div className="relative overflow-hidden rounded-xl">
        <CarouselContent>
          {testimonials.map((t, i) => (
            <CarouselItem key={i}>
              <div className="bg-surface rounded-xl border border-border p-8 flex flex-col items-center text-center min-h-[280px] justify-center">
                <Stars rating={t.rating} />
                <p className="text-fg mt-4 mb-6 max-w-lg text-base italic leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <Avatar className="h-12 w-12 mb-3 ring-2 ring-border" fallback={t.avatar} />
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-muted text-xs">{t.role}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <Dots total={testimonials.length} active={activeIndex} />
      </div>
    </Carousel>
  );
}

const logoPartners = [
  { name: "Vercel", letter: "V" },
  { name: "Netlify", letter: "N" },
  { name: "Cloudflare", letter: "C" },
  { name: "Stripe", letter: "S" },
  { name: "Supabase", letter: "S" },
  { name: "Planetscale", letter: "P" },
  { name: "Railway", letter: "R" },
  { name: "Render", letter: "R" },
  { name: "Fly.io", letter: "F" },
  { name: "Upstash", letter: "U" },
];

function LogoCarousel() {
  return (
    <Carousel className="relative w-full" opts={{ loop: true }}>
      <div className="relative">
        <CarouselContent>
          {logoPartners.map((logo, i) => (
            <CarouselItem key={i} className="basis-1/3 md:basis-1/5">
              <div className="bg-surface hover:bg-surface-hover flex h-20 items-center justify-center rounded-lg border border-border transition-colors">
                <span className="text-muted text-xl font-bold tracking-tight">
                  {logo.letter}
                </span>
                <span className="text-muted/60 text-xs font-medium ml-1">
                  {logo.name}
                </span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="from-bg pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r to-transparent" />
        <div className="from-bg pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l to-transparent" />
      </div>
    </Carousel>
  );
}

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
];

export default function CarouselPage({
  initialTab,
}: {
  initialTab?: string;
}) {
  return (
    <ExampleTabs
      title="Carousel"
      intro="A carousel with motion and swipe."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
