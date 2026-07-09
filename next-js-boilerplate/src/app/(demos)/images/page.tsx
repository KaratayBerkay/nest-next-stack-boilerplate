import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Images",
  description: "Image optimization demo",
};

export default function ImagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-brand text-sm font-semibold">Image Optimization</h2>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Local SVG
        </h3>
        <Image
          src="/vercel.svg"
          alt="Vercel logo"
          width={120}
          height={26}
          className="dark:invert"
          style={{ width: "auto", height: 26 }}
          loading="eager"
          data-testid="img-local"
        />
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          External (remotePatterns)
        </h3>
        <Image
          src="https://picsum.photos/seed/nextjs/400/300"
          alt="Random placeholder from picsum"
          width={400}
          height={300}
          priority
          className="rounded"
          data-testid="img-external"
        />
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Responsive (sizes prop)
        </h3>
        <Image
          src="https://picsum.photos/seed/responsive/800/400"
          alt="Responsive placeholder"
          width={800}
          height={400}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="rounded"
          data-testid="img-responsive"
        />
      </section>
    </div>
  );
}
