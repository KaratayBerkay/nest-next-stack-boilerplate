import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/Carousel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Stars, Dots } from "@/views/ui/carousel/CarouselHelpers";

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

export function ProductGallery() {
  return (
    <Carousel opts={{ loop: true }}>
      <div className="relative">
        <CarouselContent className="-ml-4">
          {products.map((product, i) => (
            <CarouselItem
              key={i}
              className="basis-full pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <div className="group bg-surface border-border relative h-full overflow-hidden rounded-xl border transition-shadow hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden lg:aspect-video">
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
                  <h3 className="mb-1 text-sm leading-tight font-semibold">
                    {product.name}
                  </h3>
                  <div className="mb-2 flex items-center gap-2">
                    <Stars rating={product.rating} />
                    <span className="text-muted text-xs">
                      {product.rating} ({product.reviews.toLocaleString()})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">${product.price}</span>
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
      </div>
      <Dots total={products.length} className="mt-3" />
    </Carousel>
  );
}
