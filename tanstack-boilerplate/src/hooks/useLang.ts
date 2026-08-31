"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LANG, LANGS, type Lang } from "@/constants/i18n";
import { readLangCookie } from "@/lib/read-lang-cookie";

/**
 * Current UI language. The pathname segment wins (identical on server and
 * client, reactive on navigation); the lang cookie fills in after mount for
 * routes without a locale segment, so hydration stays consistent.
 */
export function useLang(): Lang {
  const pathname = usePathname();
  const [cookieLang, setCookieLang] = useState<Lang | null>(null);

  useEffect(() => {
    setCookieLang(readLangCookie()); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  for (const seg of (pathname ?? "").split("/")) {
    if ((LANGS as readonly string[]).includes(seg)) {
      return seg as Lang;
    }
  }
  return cookieLang ?? DEFAULT_LANG;
}
