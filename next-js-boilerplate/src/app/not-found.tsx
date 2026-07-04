"use client";

import { useState } from "react";
import Link from "next/link";
import { LANGS, DEFAULT_LANG } from "@/constants/i18n";

const messages: Record<string, { pageNotFound: string; backHome: string }> = {
  en: { pageNotFound: "Page not found", backHome: "Back to Home" },
  tr: { pageNotFound: "Sayfa bulunamadı", backHome: "Ana Sayfaya Dön" },
};

function clientLang(): (typeof LANGS)[number] {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const accept = navigator.language.slice(0, 2);
  return (LANGS as readonly string[]).includes(accept)
    ? (accept as (typeof LANGS)[number])
    : DEFAULT_LANG;
}

export default function GlobalNotFound() {
  const [lang] = useState(clientLang);
  const t = messages[lang] ?? messages[DEFAULT_LANG];
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted">{t.pageNotFound}</p>
      <Link href="/" className="text-brand underline">
        {t.backHome}
      </Link>
    </div>
  );
}
