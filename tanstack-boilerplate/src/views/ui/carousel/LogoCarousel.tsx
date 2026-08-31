import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/Carousel";

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

export function LogoCarousel() {
  return (
    <Carousel opts={{ loop: true }}>
      <div className="relative">
        <CarouselContent className="-ml-3">
          {logoPartners.map((logo, i) => (
            <CarouselItem key={i} className="basis-1/3 pl-3 md:basis-1/5">
              <div className="bg-surface hover:bg-surface-hover border-border flex h-20 items-center justify-center rounded-lg border transition-colors">
                <span className="text-muted text-xl font-bold tracking-tight">
                  {logo.letter}
                </span>
                <span className="text-muted/60 ml-1 text-xs font-medium">
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
