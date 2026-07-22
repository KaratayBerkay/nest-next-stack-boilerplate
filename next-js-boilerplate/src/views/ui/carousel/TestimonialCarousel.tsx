import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/Carousel";
import { Avatar } from "@/components/ui/Avatar";
import { Stars, Dots } from "@/views/ui/carousel/CarouselHelpers";

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

export function TestimonialCarousel() {
  return (
    <Carousel opts={{ loop: true }}>
      <div className="relative">
        <CarouselContent className="-ml-4">
          {testimonials.map((t, i) => (
            <CarouselItem key={i} className="pl-4">
              <div className="bg-surface border-border flex min-h-[280px] flex-col items-center justify-center rounded-xl border p-8 text-center md:p-12">
                <Stars rating={t.rating} />
                <p className="text-fg mt-4 mb-6 max-w-2xl text-base leading-relaxed italic md:text-lg">
                  &ldquo;{t.text}&rdquo;
                </p>
                <Avatar
                  className="ring-border mb-3 h-12 w-12 ring-2"
                  fallback={t.avatar}
                />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-muted text-xs">{t.role}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </div>
      <Dots total={testimonials.length} className="mt-3" />
    </Carousel>
  );
}
