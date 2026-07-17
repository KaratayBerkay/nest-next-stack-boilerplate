"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/Carousel";
import { useCarousel } from "@/components/ui/Carousel";
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

function Dots({ total }: { total: number }) {
  const { selectedIndex } = useCarousel();
  return (
    <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full transition-all duration-300",
            i === selectedIndex ? "size-1.5 bg-fg w-4" : "size-1.5 bg-fg/40",
          )}
        />
      ))}
    </div>
  );
}

function ProductGallery() {
  return (
    <Carousel className="relative w-full" opts={{ startIndex: 0, loop: true }}>
      <div className="relative w-full overflow-hidden rounded-xl">
        <CarouselContent>
          {products.map((product, i) => (
            <CarouselItem key={i}>
              <div className="group relative bg-surface rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-lg max-w-md mx-auto">
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
        <Dots total={products.length} />
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
  return (
    <Carousel className="relative w-full" opts={{ startIndex: 0, loop: true }}>
      <div className="relative w-full overflow-hidden rounded-xl">
        <CarouselContent>
          {testimonials.map((t, i) => (
            <CarouselItem key={i}>
              <div className="bg-surface rounded-xl border border-border p-8 flex flex-col items-center text-center min-h-[280px] justify-center max-w-2xl mx-auto">
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
        <Dots total={testimonials.length} />
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
      <div className="relative w-full overflow-hidden rounded-xl">
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
        <CarouselPrevious />
        <CarouselNext />
        <div className="from-bg pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r to-transparent" />
        <div className="from-bg pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l to-transparent" />
      </div>
    </Carousel>
  );
}

const cssSlides = [
  {
    title: "Mountain Retreat",
    description: "Escape to serenity in the Swiss Alps",
    gradient: "from-emerald-800 to-teal-900",
  },
  {
    title: "Coastal Sunrise",
    description: "Golden light over the Pacific coast",
    gradient: "from-amber-700 to-orange-800",
  },
  {
    title: "Urban Nights",
    description: "City lights and skyline reflections",
    gradient: "from-indigo-800 to-violet-900",
  },
  {
    title: "Desert Dunes",
    description: "Endless waves of sand at dusk",
    gradient: "from-rose-800 to-red-900",
  },
  {
    title: "Forest Canopy",
    description: "Sunlight filtering through ancient trees",
    gradient: "from-green-800 to-emerald-900",
  },
];

function PureCssCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const itemWidth = el.scrollWidth / cssSlides.length;
    setActiveIndex(Math.round(scrollLeft / itemWidth));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const itemWidth = el.scrollWidth / cssSlides.length;
    el.scrollTo({ left: itemWidth * index, behavior: "smooth" });
  }, []);

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        className="flex w-full overflow-x-auto snap-x snap-mandatory gap-4 rounded-xl scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {cssSlides.map((slide, i) => (
          <div
            key={i}
            className="snap-center shrink-0 w-full"
          >
            <div
              className={cn(
                "relative h-64 max-w-lg mx-auto rounded-xl bg-gradient-to-br flex flex-col items-center justify-center text-center p-8",
                slide.gradient,
              )}
            >
              <h3 className="text-white text-xl font-bold mb-2">{slide.title}</h3>
              <p className="text-white/70 text-sm">{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {cssSlides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollTo(i)}
            className={cn(
              "rounded-full transition-all duration-300",
              i === activeIndex
                ? "w-4 h-1.5 bg-fg"
                : "w-1.5 h-1.5 bg-fg/30 hover:bg-fg/50",
            )}
          />
        ))}
      </div>
    </div>
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
  {
    id: "pure-css",
    title: "Pure CSS",
    description:
      "CSS scroll-snap carousel — no JS library, just native browser scrolling with Tailwind utilities.",
    render: () => <PureCssCarousel />,
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
