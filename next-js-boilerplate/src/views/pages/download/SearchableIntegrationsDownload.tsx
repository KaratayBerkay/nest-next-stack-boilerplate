"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { IconProps } from "@tabler/icons-react";
import {
  IconBrandFigma,
  IconBrandGithub,
  IconBrandGoogleDrive,
  IconBrandJira,
  IconBrandNotion,
  IconBrandSlack,
  IconBrandStripe,
  IconBrandTrello,
  IconSearch,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  DownloadMessages,
  PagesWithDownloadMessages,
} from "@/types/pages/download/DownloadMessages-types";

interface IntegrationItem {
  id: string;
  icon: React.ComponentType<IconProps>;
  nameKey: string;
  categoryKey: string;
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    id: "slack",
    icon: IconBrandSlack,
    nameKey: "download18Integration1Name",
    categoryKey: "download18Category1",
  },
  {
    id: "github",
    icon: IconBrandGithub,
    nameKey: "download18Integration2Name",
    categoryKey: "download18Category2",
  },
  {
    id: "figma",
    icon: IconBrandFigma,
    nameKey: "download18Integration3Name",
    categoryKey: "download18Category3",
  },
  {
    id: "notion",
    icon: IconBrandNotion,
    nameKey: "download18Integration4Name",
    categoryKey: "download18Category4",
  },
  {
    id: "google-drive",
    icon: IconBrandGoogleDrive,
    nameKey: "download18Integration5Name",
    categoryKey: "download18Category5",
  },
  {
    id: "trello",
    icon: IconBrandTrello,
    nameKey: "download18Integration6Name",
    categoryKey: "download18Category6",
  },
  {
    id: "jira",
    icon: IconBrandJira,
    nameKey: "download18Integration7Name",
    categoryKey: "download18Category7",
  },
  {
    id: "stripe",
    icon: IconBrandStripe,
    nameKey: "download18Integration8Name",
    categoryKey: "download18Category8",
  },
];

function filterIntegrations(
  integrations: readonly IntegrationItem[],
  query: string,
  d: DownloadMessages,
) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return integrations;
  }
  return integrations.filter((item) => {
    const name = d[item.nameKey].toLowerCase();
    const category = d[item.categoryKey].toLowerCase();
    return name.includes(q) || category.includes(q);
  });
}

function handleSearchChange(
  event: ChangeEvent<HTMLInputElement>,
  setQuery: Dispatch<SetStateAction<string>>,
) {
  setQuery(event.target.value);
}

export function SearchableIntegrationsDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => filterIntegrations(INTEGRATIONS, query, d),
    [query, d],
  );

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-muted text-xs font-semibold tracking-widest uppercase">
            {d.download18Badge}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {d.download18Title}
          </h2>
          <p className="text-muted max-w-2xl lg:text-lg">
            {d.download18Description}
          </p>
        </div>
        <div className="mt-10 flex justify-center">
          <Input
            type="search"
            value={query}
            onChange={(event) => handleSearchChange(event, setQuery)}
            placeholder={d.download18SearchPlaceholder}
            aria-label={d.download18SearchAria}
            leftIcon={<IconSearch size={16} />}
            className="w-full max-w-md"
          />
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="border-border bg-surface hover:bg-surface-hover flex items-center gap-4 rounded-2xl border p-5 shadow-xs transition-colors"
              >
                <span
                  aria-hidden="true"
                  className="border-border bg-surface-hover/50 text-brand flex size-11 shrink-0 items-center justify-center rounded-xl border"
                >
                  <Icon size={22} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-fg text-sm font-semibold">
                    {d[item.nameKey]}
                  </span>
                  <span className="text-muted text-xs">
                    {d[item.categoryKey]}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <p className="text-muted mt-10 text-center text-sm">
            {d.download18NoResults}
          </p>
        )}
      </div>
    </section>
  );
}
