// Ported from next-js-boilerplate/src/app/i18n/[lang]/LocaleSwitcher.tsx
import Link from "next/link";
import { locales } from "@/lib/i18n/config";
import type { LocaleSwitcherProps } from "@/types/i18n/LocaleSwitcher-types";

// The active locale is already known from the route's `$lang` param, so
// active state is computed at render and each option is a soft `<Link>`.
export function LocaleSwitcher({ current, label }: LocaleSwitcherProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted text-xs font-semibold">{label}</span>
      <nav className="flex gap-2" aria-label="Language switcher">
        {locales.map((locale) => {
          const active = locale === current;
          return (
            <Link
              key={locale}
              href={`/i18n/${locale}`}
              data-testid={`switch-${locale}`}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "bg-fg text-bg rounded px-3 py-1 text-xs"
                  : "border-border text-muted rounded px-3 py-1 text-xs"
              }
            >
              {locale.toUpperCase()}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
