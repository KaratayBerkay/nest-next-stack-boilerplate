"use client";

import { useState } from "react";
import {
  IconBrandFigma,
  IconBrandGithub,
  IconBrandNotion,
  IconBrandSlack,
  IconBrandStripe,
  IconBrandZapier,
  IconDotsVertical,
  IconSearch,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import { NativeSelect } from "@/components/ui/NativeSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsIntegrationsMessages } from "@/types/pages/settings-integrations/SettingsIntegrationsMessages-types";

type Status = "connected" | "not-connected" | "attention";

const CATEGORIES = [
  { id: "developer", labelKey: "settingsIntegrations3CategoryDeveloper" },
  { id: "communication", labelKey: "settingsIntegrations3CategoryCommunication" },
  { id: "productivity", labelKey: "settingsIntegrations3CategoryProductivity" },
  { id: "design", labelKey: "settingsIntegrations3CategoryDesign" },
  { id: "automation", labelKey: "settingsIntegrations3CategoryAutomation" },
  { id: "payments", labelKey: "settingsIntegrations3CategoryPayments" },
] as const;

interface AppRow {
  id: string;
  icon: Icon;
  nameKey: string;
  descKey: string;
  categoryId: (typeof CATEGORIES)[number]["id"];
  status: Status;
  lastSyncKey: string;
}

const ROWS: AppRow[] = [
  {
    id: "github",
    icon: IconBrandGithub,
    nameKey: "settingsIntegrations3App1Name",
    descKey: "settingsIntegrations3App1Desc",
    categoryId: "developer",
    status: "connected",
    lastSyncKey: "settingsIntegrations3App1LastSync",
  },
  {
    id: "slack",
    icon: IconBrandSlack,
    nameKey: "settingsIntegrations3App2Name",
    descKey: "settingsIntegrations3App2Desc",
    categoryId: "communication",
    status: "connected",
    lastSyncKey: "settingsIntegrations3App2LastSync",
  },
  {
    id: "notion",
    icon: IconBrandNotion,
    nameKey: "settingsIntegrations3App3Name",
    descKey: "settingsIntegrations3App3Desc",
    categoryId: "productivity",
    status: "attention",
    lastSyncKey: "settingsIntegrations3App3LastSync",
  },
  {
    id: "figma",
    icon: IconBrandFigma,
    nameKey: "settingsIntegrations3App4Name",
    descKey: "settingsIntegrations3App4Desc",
    categoryId: "design",
    status: "not-connected",
    lastSyncKey: "settingsIntegrations3App4LastSync",
  },
  {
    id: "zapier",
    icon: IconBrandZapier,
    nameKey: "settingsIntegrations3App5Name",
    descKey: "settingsIntegrations3App5Desc",
    categoryId: "automation",
    status: "not-connected",
    lastSyncKey: "settingsIntegrations3App5LastSync",
  },
  {
    id: "stripe",
    icon: IconBrandStripe,
    nameKey: "settingsIntegrations3App6Name",
    descKey: "settingsIntegrations3App6Desc",
    categoryId: "payments",
    status: "connected",
    lastSyncKey: "settingsIntegrations3App6LastSync",
  },
];

export function IntegrationStatusTableSettingsIntegrations() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithSettingsIntegrationsMessages;
  const si = t.settingsIntegrations;

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = ROWS.filter((row) => {
    const matchesCategory = category === "all" || row.categoryId === category;
    const matchesQuery = si[row.nameKey]
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const statusMeta: Record<Status, { badge: "success" | "outline" | "warning"; labelKey: string }> = {
    connected: { badge: "success", labelKey: "settingsIntegrations3StatusConnected" },
    "not-connected": { badge: "outline", labelKey: "settingsIntegrations3StatusNotConnected" },
    attention: { badge: "warning", labelKey: "settingsIntegrations3StatusAttention" },
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle>{si.settingsIntegrations3Heading}</CardTitle>
                <CardDescription>{si.settingsIntegrations3Subheading}</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={si.settingsIntegrations3SearchPlaceholder}
                  aria-label={si.settingsIntegrations3SearchAria}
                  leftIcon={<IconSearch size={15} aria-hidden="true" />}
                  className="sm:max-w-56"
                />
                <div className="w-full sm:w-44">
                  <NativeSelect
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    aria-label={si.settingsIntegrations3CategoryFilterAria}
                  >
                    <option value="all">
                      {si.settingsIntegrations3CategoryFilterAllLabel}
                    </option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {si[cat.labelKey]}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{si.settingsIntegrations3ColIntegration}</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {si.settingsIntegrations3ColCategory}
                  </TableHead>
                  <TableHead>{si.settingsIntegrations3ColStatus}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {si.settingsIntegrations3ColLastSync}
                  </TableHead>
                  <TableHead className="text-right">
                    {si.settingsIntegrations3ColActions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => {
                  const meta = statusMeta[row.status];
                  const categoryLabel = CATEGORIES.find(
                    (cat) => cat.id === row.categoryId,
                  )?.labelKey;
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-surface-hover text-fg flex size-8 shrink-0 items-center justify-center rounded-md">
                            <row.icon size={16} aria-hidden="true" />
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <span className="text-fg truncate text-sm font-medium">
                              {si[row.nameKey]}
                            </span>
                            <span className="text-muted truncate text-xs">
                              {si[row.descKey]}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-muted text-xs">
                          {categoryLabel ? si[categoryLabel] : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={meta.badge}>{si[meta.labelKey]}</Badge>
                      </TableCell>
                      <TableCell className="text-muted hidden text-xs md:table-cell">
                        {si[row.lastSyncKey]}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm">
                            {si.settingsIntegrations3ConfigureButtonLabel}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              aria-label={`${si.settingsIntegrations3RowMenuAriaPrefix} ${si[row.nameKey]}`}
                              className="hover:bg-surface-hover size-7 shrink-0 rounded-md"
                            >
                              <IconDotsVertical size={16} aria-hidden="true" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-44">
                              <DropdownMenuItem>
                                {row.status === "not-connected"
                                  ? si.settingsIntegrations3MenuReconnectLabel
                                  : si.settingsIntegrations3MenuDisconnectLabel}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted py-10 text-center text-sm"
                    >
                      {si.settingsIntegrations3EmptyStateLabel}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
