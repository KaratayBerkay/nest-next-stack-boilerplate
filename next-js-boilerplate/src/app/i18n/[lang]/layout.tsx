import { containerClass } from "@/constants/site";
import type { I18nLayoutProps } from "@/types/i18n/I18nLayout-types";

// The i18n demo lives under its own top-level `/i18n` segment (like `/security`)
// rather than prefixing the whole app with `[lang]` — that keeps the locale
// concern scoped and leaves every other route's tests untouched.
export default function I18nLayout({
  children,
}: I18nLayoutProps) {
  return (
    <main className={`${containerClass} flex flex-1 flex-col gap-6 py-16`}>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Internationalization
        </h1>
        <p className="text-muted max-w-xl text-sm">
          A <code>[lang]</code> dynamic segment, server-side dictionaries, and{" "}
          <code>Accept-Language</code> negotiation in <code>proxy.ts</code>.
        </p>
      </header>
      <section className="surface flex flex-col gap-2 p-5">{children}</section>
    </main>
  );
}
