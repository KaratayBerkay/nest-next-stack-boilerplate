import Link from "next/link";
import { containerClass, SITE } from "@/constants/site";
import { PRICING_PATH } from "@/constants/routes";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import type { MarketingLayoutProps } from "@/types/marketing/MarketingLayout-types";

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <main className={`${containerClass} flex flex-1 flex-col gap-6 py-16`}>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <p className="text-brand text-xs font-semibold tracking-wide uppercase">
            <Link href="/">{SITE.name}</Link>
          </p>
          <nav className="flex items-center gap-4">
            <Link
              href={PRICING_PATH}
              className="text-muted hover:text-fg text-sm transition-colors"
            >
              Pricing
            </Link>
          </nav>
        </div>
        <ThemeToggle />
      </header>
      <section className="surface flex flex-col gap-2 p-5">{children}</section>
    </main>
  );
}
