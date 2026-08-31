"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { NativeSelect } from "@/components/ui/NativeSelect";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { Switch } from "@/components/ui/Switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
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

const INDUSTRY_OPTIONS = [
  "crudCompanies2IndustryOption1",
  "crudCompanies2IndustryOption2",
  "crudCompanies2IndustryOption3",
  "crudCompanies2IndustryOption4",
] as const;

interface RowRef {
  nameKey: string;
  industryKey: string;
  locationKey: string;
  status: StatusValue;
}

const ROW_REFS: RowRef[] = [
  {
    nameKey: "crudCompanies2Row1Name",
    industryKey: "crudCompanies2Row1Industry",
    locationKey: "crudCompanies2Row1Location",
    status: "active",
  },
  {
    nameKey: "crudCompanies2Row2Name",
    industryKey: "crudCompanies2Row2Industry",
    locationKey: "crudCompanies2Row2Location",
    status: "prospect",
  },
  {
    nameKey: "crudCompanies2Row3Name",
    industryKey: "crudCompanies2Row3Industry",
    locationKey: "crudCompanies2Row3Location",
    status: "active",
  },
  {
    nameKey: "crudCompanies2Row4Name",
    industryKey: "crudCompanies2Row4Industry",
    locationKey: "crudCompanies2Row4Location",
    status: "inactive",
  },
  {
    nameKey: "crudCompanies2Row5Name",
    industryKey: "crudCompanies2Row5Industry",
    locationKey: "crudCompanies2Row5Location",
    status: "prospect",
  },
];

interface CompanyRow {
  id: string;
  avatarSeed: string;
  name: string;
  industry: string;
  location: string;
  status: StatusValue;
  isNew?: boolean;
}

function buildInitialRows(c: CrudCompaniesMessages): CompanyRow[] {
  return ROW_REFS.map((ref, index) => ({
    id: String(index + 1),
    avatarSeed: `cc2-${index + 1}`,
    name: c[ref.nameKey],
    industry: c[ref.industryKey],
    location: c[ref.locationKey],
    status: ref.status,
  }));
}

const EMPTY_DRAFT = {
  name: "",
  industry: INDUSTRY_OPTIONS[0] as string,
  email: "",
  website: "",
};

export function CompanyListSheetFormCrudCompanies() {
  const t = useMessages("pages") as unknown as PagesWithCrudCompaniesMessages;
  const c = t.crudCompanies;

  const [rows, setRows] = useState<CompanyRow[]>(() => buildInitialRows(c));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(true);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    setRows((prev) => [
      {
        id: `new-${prev.length + 1}`,
        avatarSeed: `cc2-new-${prev.length + 1}`,
        name: draft.name,
        industry: c[draft.industry],
        location: c.crudCompanies2NewLocationFallback,
        status: active ? "active" : "prospect",
        isNew: true,
      },
      ...prev,
    ]);
    setDraft(EMPTY_DRAFT);
    setActive(true);
    setOpen(false);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 className="text-3xl font-medium tracking-tighter md:text-4xl">
              {c.crudCompanies2Heading}
            </h2>
            <p className="text-muted text-base">
              {c.crudCompanies2Description}
            </p>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="primary" leftIcon={<IconPlus size={16} />}>
                {c.crudCompanies2AddButton}
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <form
                onSubmit={handleSubmit}
                className="flex h-full flex-col gap-6"
              >
                <SheetHeader>
                  <SheetTitle>{c.crudCompanies2SheetTitle}</SheetTitle>
                  <SheetDescription>
                    {c.crudCompanies2SheetDescription}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc2-field-name">
                      {c.crudCompanies2FieldNameLabel}
                    </Label>
                    <Input
                      id="cc2-field-name"
                      value={draft.name}
                      placeholder={c.crudCompanies2FieldNamePlaceholder}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc2-field-industry">
                      {c.crudCompanies2FieldIndustryLabel}
                    </Label>
                    <NativeSelect
                      id="cc2-field-industry"
                      value={draft.industry}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          industry: event.target.value,
                        }))
                      }
                    >
                      {INDUSTRY_OPTIONS.map((key) => (
                        <option key={key} value={key}>
                          {c[key]}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc2-field-email">
                      {c.crudCompanies2FieldEmailLabel}
                    </Label>
                    <Input
                      id="cc2-field-email"
                      type="email"
                      value={draft.email}
                      placeholder={c.crudCompanies2FieldEmailPlaceholder}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc2-field-website">
                      {c.crudCompanies2FieldWebsiteLabel}
                    </Label>
                    <Input
                      id="cc2-field-website"
                      value={draft.website}
                      placeholder={c.crudCompanies2FieldWebsitePlaceholder}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          website: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <Switch
                    checked={active}
                    onChange={(event) => setActive(event.target.checked)}
                    label={c.crudCompanies2FieldActiveLabel}
                  />
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button type="button" variant="ghost">
                      {c.crudCompanies2CancelButton}
                    </Button>
                  </SheetClose>
                  <Button type="submit" variant="primary">
                    {c.crudCompanies2SubmitButton}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-muted text-sm">
            {c.crudCompanies2CountLabel.replace("{n}", String(rows.length))}
          </span>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{c.crudCompanies2ColCompany}</TableHead>
                <TableHead>{c.crudCompanies2ColIndustry}</TableHead>
                <TableHead>{c.crudCompanies2ColLocation}</TableHead>
                <TableHead>{c.crudCompanies2ColStatus}</TableHead>
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
                      {row.isNew && (
                        <Badge variant="soft" size="sm">
                          {c.crudCompanies2NewBadge}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted">{row.industry}</TableCell>
                  <TableCell className="text-muted">{row.location}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                        STATUS_CLASSES[row.status],
                      )}
                    >
                      {row.status === "active"
                        ? c.crudCompanies2StatusActive
                        : row.status === "prospect"
                          ? c.crudCompanies2StatusProspect
                          : c.crudCompanies2StatusInactive}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
