"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import { IconSearch } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";

interface SearchRow {
  id: string;
  nameKey: string;
  emailKey: string;
  roleKey: string;
}

const SEARCH_ROWS: SearchRow[] = [
  {
    id: "s1",
    nameKey: "dataTable30Row1Name",
    emailKey: "dataTable30Row1Email",
    roleKey: "dataTable30Row1Role",
  },
  {
    id: "s2",
    nameKey: "dataTable30Row2Name",
    emailKey: "dataTable30Row2Email",
    roleKey: "dataTable30Row2Role",
  },
  {
    id: "s3",
    nameKey: "dataTable30Row3Name",
    emailKey: "dataTable30Row3Email",
    roleKey: "dataTable30Row3Role",
  },
  {
    id: "s4",
    nameKey: "dataTable30Row4Name",
    emailKey: "dataTable30Row4Email",
    roleKey: "dataTable30Row4Role",
  },
  {
    id: "s5",
    nameKey: "dataTable30Row5Name",
    emailKey: "dataTable30Row5Email",
    roleKey: "dataTable30Row5Role",
  },
  {
    id: "s6",
    nameKey: "dataTable30Row6Name",
    emailKey: "dataTable30Row6Email",
    roleKey: "dataTable30Row6Role",
  },
];

function highlights(text: string, query: string): React.ReactNode[] {
  if (!query) {
    return [text];
  }
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let index = lowerText.indexOf(lowerQuery);
  while (index !== -1) {
    if (index > cursor) {
      nodes.push(text.slice(cursor, index));
    }
    nodes.push(
      <mark
        key={`${index}-${query}`}
        className="bg-warning/30 text-fg rounded-sm px-0.5"
      >
        {text.slice(index, index + query.length)}
      </mark>,
    );
    cursor = index + query.length;
    index = lowerText.indexOf(lowerQuery, cursor);
  }
  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }
  return nodes;
}

function matchesRow(row: string[], query: string): boolean {
  return row.some((value) => value.toLowerCase().includes(query.toLowerCase()));
}

function countMatches(values: string[], query: string): number {
  if (!query) {
    return 0;
  }
  const lowerQuery = query.toLowerCase();
  return values.reduce(
    (total, value) => total + value.toLowerCase().split(lowerQuery).length - 1,
    0,
  );
}

export function SearchHighlightDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;

  const [query, setQuery] = useState("");

  const rows = SEARCH_ROWS.map((row) => ({
    row,
    values: [d[row.nameKey], d[row.emailKey], d[row.roleKey]],
  }));
  const filtered = rows.filter(({ values }) => matchesRow(values, query));
  const matchCount = countMatches(
    rows.flatMap(({ values }) => values),
    query,
  );
  const matchNote = d.dataTable30MatchNote.replace("{n}", String(matchCount));

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable30Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable30TabDescription}
          </Typography>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative max-w-sm flex-1">
              <IconSearch
                size={16}
                className="text-muted absolute top-1/2 left-3 -translate-y-1/2"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={d.dataTable30SearchPlaceholder}
                className="pl-9"
              />
            </div>
            <span className="text-muted text-sm">{matchNote}</span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{d.dataTable30ColName}</TableHead>
                <TableHead>{d.dataTable30ColEmail}</TableHead>
                <TableHead>{d.dataTable30ColRole}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(({ row, values }) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    {highlights(values[0], query)}
                  </TableCell>
                  <TableCell className="text-muted">
                    {highlights(values[1], query)}
                  </TableCell>
                  <TableCell>{highlights(values[2], query)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted h-24 text-center"
                  >
                    {d.dataTable30Empty}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
