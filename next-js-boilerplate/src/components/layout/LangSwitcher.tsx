"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LANGS, LANG_COOKIE, type Lang } from "@/constants/i18n";
import { IconLanguage } from "@tabler/icons-react";
import { useClickOutside } from "@/hooks/useClickOutside";

function setLangCookie(locale: Lang): void {
  document.cookie = `${LANG_COOKIE}=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

/** Extract the locale segment from the pathname, if any. */
function detectLang(pathname: string): Lang | null {
  const segs = pathname.split("/").filter(Boolean);
  for (const seg of segs) {
    if ((LANGS as readonly string[]).includes(seg)) {
      return seg as Lang;
    }
  }
  return null;
}

// fallow-ignore-next-line complexity
function localizePathname(
  pathname: string,
  currentLang: string | null,
  target: Lang,
): string {
  if (currentLang && (LANGS as readonly string[]).includes(currentLang)) {
    const regex = new RegExp(`^/([^/]+/)${currentLang}(/|$)`);
    if (regex.test(pathname)) {
      return pathname.replace(regex, `/$1${target}$2`);
    }
    const regex2 = new RegExp(`^/${currentLang}(/|$)`);
    if (regex2.test(pathname)) {
      return pathname.replace(regex2, `/${target}$1`);
    }
  }
  return pathname;
}

export function LangSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentLang = detectLang(pathname ?? "");

  useClickOutside(ref, () => setOpen(false));

  const switchLang = useCallback(
    (target: Lang) => {
      setLangCookie(target);
      setOpen(false);
      const localized = localizePathname(pathname ?? "", currentLang, target);
      const qs = searchParams.toString();
      router.push(qs ? `${localized}?${qs}` : localized);
    },
    [pathname, currentLang, searchParams, router],
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="text-muted hover:bg-surface-hover relative rounded-lg p-1.5"
        aria-label="Switch language"
      >
        <IconLanguage size={20} stroke={1.5} />
      </button>
      {open && (
        <div className="bg-bg border-border absolute top-full right-0 mt-1 flex min-w-[80px] flex-col rounded-lg border p-1 shadow-sm">
          {LANGS.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLang(locale)}
              className={`hover:bg-surface-hover rounded-md px-3 py-1.5 text-left text-xs font-medium ${
                locale === currentLang ? "text-brand" : "text-muted"
              }`}
            >
              {locale.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
