"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, usePathname, useRouter } from "next/navigation";
import { IconArrowsMinimize, IconSearch } from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { TemplateCard } from "./TemplateCard";
import { TemplateDetail } from "./TemplateDetail";
import type {
  TemplateBrowserMessages,
  TemplateBrowserProps,
} from "@/types/pages/TemplateBrowser-types";

function buildQuery(tab: string | null, full: boolean): string {
  const params = new URLSearchParams();
  if (tab) params.set("tab", tab);
  if (tab && full) params.set("full", "1");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function TemplateBrowser({
  title,
  intro,
  examples,
  category,
  initialTab,
  initialFull,
}: TemplateBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";
  const t = useMessages("pages").browser as TemplateBrowserMessages;

  const validInitial =
    initialTab && examples.some((e) => e.id === initialTab) ? initialTab : null;
  const [currentId, setCurrentId] = useState<string | null>(validInitial);
  const [fullOpen, setFullOpen] = useState(
    Boolean(initialFull && validInitial),
  );
  const [codeOpen, setCodeOpen] = useState(false);
  const [query, setQuery] = useState("");

  const currentIndex = examples.findIndex((e) => e.id === currentId);
  const current = currentIndex >= 0 ? examples[currentIndex] : null;

  const navigate = useCallback(
    (tab: string | null, full: boolean) => {
      setCurrentId(tab);
      setFullOpen(Boolean(tab && full));
      if (!tab) setCodeOpen(false);
      router.replace(`${pathname}${buildQuery(tab, full)}`, { scroll: false });
    },
    [router, pathname],
  );

  // Exit full screen with Escape; lock the page scroll behind the overlay.
  useEffect(() => {
    if (!fullOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") navigate(currentId, false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [fullOpen, currentId, navigate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    if (!q) return examples;
    return examples.filter(
      (e) =>
        e.title.toLocaleLowerCase(lang).includes(q) ||
        e.description.toLocaleLowerCase(lang).includes(q),
    );
  }, [examples, query, lang]);

  return (
    <div className="flex w-full flex-col gap-6">
      {current ? (
        <TemplateDetail
          example={current}
          index={currentIndex}
          total={examples.length}
          category={category}
          codeOpen={codeOpen}
          onToggleCode={() => setCodeOpen((prev) => !prev)}
          onBack={() => navigate(null, false)}
          onPrev={() => {
            if (currentIndex > 0)
              navigate(examples[currentIndex - 1].id, false);
          }}
          onNext={() => {
            if (currentIndex < examples.length - 1)
              navigate(examples[currentIndex + 1].id, false);
          }}
          onOpenFull={() => navigate(currentId, true)}
          t={t}
        />
      ) : (
        <>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted text-sm">{intro}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full max-w-xs">
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.searchPlaceholder}
                leftIcon={<IconSearch size={16} />}
                aria-label={t.searchPlaceholder}
              />
            </div>
            <span className="text-muted text-xs">
              {t.countLabel.replace("{count}", String(filtered.length))}
            </span>
          </div>
          {filtered.length === 0 ? (
            <div className="border-border flex flex-col items-start gap-3 rounded-lg border border-dashed p-8">
              <p className="text-muted text-sm">{t.noResults}</p>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setQuery("")}
              >
                {t.clearSearch}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((example) => (
                <TemplateCard
                  key={example.id}
                  example={example}
                  onOpen={() => navigate(example.id, false)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {fullOpen &&
        current &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="pointer-events-auto fixed inset-0 z-[100]">
            <div className="bg-bg absolute inset-0 overflow-y-auto overscroll-contain">
              {current.render()}
            </div>
            <div className="absolute top-4 right-4">
              <IconButton
                type="button"
                variant="default"
                size="icon"
                label={t.exitFullScreen}
                icon={<IconArrowsMinimize size={18} />}
                onClick={() => navigate(currentId, false)}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
