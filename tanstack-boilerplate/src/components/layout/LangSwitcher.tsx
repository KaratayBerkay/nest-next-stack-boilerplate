"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LANGS, type Lang } from "@/constants/i18n";
import { IconLanguage } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import { useClickOutside } from "@/hooks/useClickOutside";
import {
  detectLang,
  localizePathname,
  setLangCookie,
} from "@/lib/i18n/lang-routing";

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
      <IconButton
        icon={<IconLanguage size={20} />}
        label="Switch language"
        onClick={() => setOpen((p) => !p)}
      />
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
