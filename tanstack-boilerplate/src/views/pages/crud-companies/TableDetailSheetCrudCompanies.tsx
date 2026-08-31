"use client";

import { useState } from "react";
import { IconEye } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  CrudCompaniesMessages,
  PagesWithCrudCompaniesMessages,
} from "@/types/pages/crud-companies/CrudCompaniesMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

type StatusValue = "active" | "prospect" | "inactive";

const STATUS_CLASSES: Record<StatusValue, string> = {
  active: "bg-success/10 text-success",
  prospect: "bg-info/10 text-info",
  inactive: "bg-muted/15 text-muted",
};

interface RowRef {
  nameKey: string;
  industryKey: string;
  employeesKey: string;
  foundedKey: string;
  revenueKey: string;
  websiteKey: string;
  contactNameKey: string;
  contactRoleKey: string;
  contactEmailKey: string;
  noteKey: string;
  status: StatusValue;
}

const ROW_REFS: RowRef[] = [
  {
    nameKey: "crudCompanies6Row1Name",
    industryKey: "crudCompanies6Row1Industry",
    employeesKey: "crudCompanies6Row1Employees",
    foundedKey: "crudCompanies6Row1Founded",
    revenueKey: "crudCompanies6Row1Revenue",
    websiteKey: "crudCompanies6Row1Website",
    contactNameKey: "crudCompanies6Row1ContactName",
    contactRoleKey: "crudCompanies6Row1ContactRole",
    contactEmailKey: "crudCompanies6Row1ContactEmail",
    noteKey: "crudCompanies6Row1Note",
    status: "active",
  },
  {
    nameKey: "crudCompanies6Row2Name",
    industryKey: "crudCompanies6Row2Industry",
    employeesKey: "crudCompanies6Row2Employees",
    foundedKey: "crudCompanies6Row2Founded",
    revenueKey: "crudCompanies6Row2Revenue",
    websiteKey: "crudCompanies6Row2Website",
    contactNameKey: "crudCompanies6Row2ContactName",
    contactRoleKey: "crudCompanies6Row2ContactRole",
    contactEmailKey: "crudCompanies6Row2ContactEmail",
    noteKey: "crudCompanies6Row2Note",
    status: "prospect",
  },
  {
    nameKey: "crudCompanies6Row3Name",
    industryKey: "crudCompanies6Row3Industry",
    employeesKey: "crudCompanies6Row3Employees",
    foundedKey: "crudCompanies6Row3Founded",
    revenueKey: "crudCompanies6Row3Revenue",
    websiteKey: "crudCompanies6Row3Website",
    contactNameKey: "crudCompanies6Row3ContactName",
    contactRoleKey: "crudCompanies6Row3ContactRole",
    contactEmailKey: "crudCompanies6Row3ContactEmail",
    noteKey: "crudCompanies6Row3Note",
    status: "inactive",
  },
];

interface CompanyRow {
  id: string;
  avatarSeed: string;
  name: string;
  industry: string;
  employees: string;
  founded: string;
  revenue: string;
  website: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  note: string;
  status: StatusValue;
  statusLabel: string;
}

function statusLabel(c: CrudCompaniesMessages, status: StatusValue): string {
  switch (status) {
    case "active":
      return c.crudCompanies6StatusActive;
    case "prospect":
      return c.crudCompanies6StatusProspect;
    default:
      return c.crudCompanies6StatusInactive;
  }
}

function buildRows(c: CrudCompaniesMessages): CompanyRow[] {
  return ROW_REFS.map((ref, index) => ({
    id: String(index + 1),
    avatarSeed: `cc6-${index + 1}`,
    name: c[ref.nameKey],
    industry: c[ref.industryKey],
    employees: c[ref.employeesKey],
    founded: c[ref.foundedKey],
    revenue: c[ref.revenueKey],
    website: c[ref.websiteKey],
    contactName: c[ref.contactNameKey],
    contactRole: c[ref.contactRoleKey],
    contactEmail: c[ref.contactEmailKey],
    note: c[ref.noteKey],
    status: ref.status,
    statusLabel: statusLabel(c, ref.status),
  }));
}

function StatusPill({ status, label }: { status: StatusValue; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_CLASSES[status],
      )}
    >
      {label}
    </span>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-fg font-medium">{value}</span>
    </div>
  );
}

export function TableDetailSheetCrudCompanies() {
  const t = useMessages("pages") as unknown as PagesWithCrudCompaniesMessages;
  const c = t.crudCompanies;
  const rows = buildRows(c);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rows.find((row) => row.id === selectedId) ?? null;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-3xl font-medium tracking-tighter md:text-4xl">
            {c.crudCompanies6Heading}
          </h2>
          <p className="text-muted text-base">{c.crudCompanies6Description}</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{c.crudCompanies6ColCompany}</TableHead>
              <TableHead>{c.crudCompanies6ColIndustry}</TableHead>
              <TableHead>{c.crudCompanies6ColEmployees}</TableHead>
              <TableHead>{c.crudCompanies6ColStatus}</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={placeholderImage(row.avatarSeed, "1x1")}
                      alt=""
                      fallback={row.name}
                      size="sm"
                    />
                    <span className="font-medium">{row.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted">{row.industry}</TableCell>
                <TableCell className="text-muted">{row.employees}</TableCell>
                <TableCell>
                  <StatusPill status={row.status} label={row.statusLabel} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    leftIcon={<IconEye size={15} />}
                    onClick={() => setSelectedId(row.id)}
                  >
                    {c.crudCompanies6ViewButton}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet
        open={selected !== null}
        onOpenChange={(next) => {
          if (!next) setSelectedId(null);
        }}
      >
        <SheetContent side="right">
          {selected && (
            <div className="flex h-full flex-col gap-5">
              <SheetHeader className="text-left">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={placeholderImage(selected.avatarSeed, "1x1")}
                    alt=""
                    fallback={selected.name}
                    size="lg"
                  />
                  <div className="flex flex-col gap-1">
                    <SheetTitle>{selected.name}</SheetTitle>
                    <StatusPill
                      status={selected.status}
                      label={selected.statusLabel}
                    />
                  </div>
                </div>
                <SheetDescription>{selected.industry}</SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">
                    {c.crudCompanies6TabOverview}
                  </TabsTrigger>
                  <TabsTrigger value="contact">
                    {c.crudCompanies6TabContact}
                  </TabsTrigger>
                  <TabsTrigger value="notes">
                    {c.crudCompanies6TabNotes}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="divide-border divide-y">
                  <StatRow
                    label={c.crudCompanies6StatLabelFounded}
                    value={selected.founded}
                  />
                  <StatRow
                    label={c.crudCompanies6StatLabelRevenue}
                    value={selected.revenue}
                  />
                  <StatRow
                    label={c.crudCompanies6StatLabelWebsite}
                    value={selected.website}
                  />
                </TabsContent>
                <TabsContent value="contact" className="flex flex-col gap-3">
                  <span className="text-muted text-xs font-medium tracking-wider uppercase">
                    {c.crudCompanies6ContactHeading}
                  </span>
                  <div className="border-border flex items-center gap-3 rounded-lg border p-3">
                    <Avatar
                      fallback={selected.contactName}
                      size="sm"
                      variant="brand"
                    />
                    <div className="flex flex-col">
                      <span className="text-fg text-sm font-medium">
                        {selected.contactName}
                      </span>
                      <span className="text-muted text-xs">
                        {selected.contactRole}
                      </span>
                      <span className="text-brand text-xs">
                        {selected.contactEmail}
                      </span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="notes" className="flex flex-col gap-3">
                  <span className="text-muted text-xs font-medium tracking-wider uppercase">
                    {c.crudCompanies6NotesHeading}
                  </span>
                  <p className="text-muted text-sm leading-relaxed">
                    {selected.note}
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}
