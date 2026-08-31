"use client";

import { useState } from "react";
import {
  IconBuildingSkyscraper,
  IconChevronDown,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  CrudCompaniesMessages,
  PagesWithCrudCompaniesMessages,
} from "@/types/pages/crud-companies/CrudCompaniesMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const INDUSTRY_OPTIONS = [
  "crudCompanies3IndustryOption1",
  "crudCompanies3IndustryOption2",
  "crudCompanies3IndustryOption3",
  "crudCompanies3IndustryOption4",
] as const;

type IndustryKey = (typeof INDUSTRY_OPTIONS)[number];

interface CardRef {
  nameKey: string;
  employeesKey: string;
  websiteKey: string;
  descriptionKey: string;
  industryKey: IndustryKey;
}

const CARD_REFS: CardRef[] = [
  {
    nameKey: "crudCompanies3Card1Name",
    employeesKey: "crudCompanies3Card1Employees",
    websiteKey: "crudCompanies3Card1Website",
    descriptionKey: "crudCompanies3Card1Description",
    industryKey: INDUSTRY_OPTIONS[0],
  },
  {
    nameKey: "crudCompanies3Card2Name",
    employeesKey: "crudCompanies3Card2Employees",
    websiteKey: "crudCompanies3Card2Website",
    descriptionKey: "crudCompanies3Card2Description",
    industryKey: INDUSTRY_OPTIONS[1],
  },
  {
    nameKey: "crudCompanies3Card3Name",
    employeesKey: "crudCompanies3Card3Employees",
    websiteKey: "crudCompanies3Card3Website",
    descriptionKey: "crudCompanies3Card3Description",
    industryKey: INDUSTRY_OPTIONS[2],
  },
  {
    nameKey: "crudCompanies3Card4Name",
    employeesKey: "crudCompanies3Card4Employees",
    websiteKey: "crudCompanies3Card4Website",
    descriptionKey: "crudCompanies3Card4Description",
    industryKey: INDUSTRY_OPTIONS[3],
  },
  {
    nameKey: "crudCompanies3Card5Name",
    employeesKey: "crudCompanies3Card5Employees",
    websiteKey: "crudCompanies3Card5Website",
    descriptionKey: "crudCompanies3Card5Description",
    industryKey: INDUSTRY_OPTIONS[0],
  },
];

interface CompanyCard {
  id: string;
  avatarSeed: string;
  name: string;
  employees: string;
  website: string;
  description: string;
  industryKey: IndustryKey;
}

function buildInitialCards(c: CrudCompaniesMessages): CompanyCard[] {
  return CARD_REFS.map((ref, index) => ({
    id: String(index + 1),
    avatarSeed: `cc3-${index + 1}`,
    name: c[ref.nameKey],
    employees: c[ref.employeesKey],
    website: c[ref.websiteKey],
    description: c[ref.descriptionKey],
    industryKey: ref.industryKey,
  }));
}

const EMPTY_DRAFT = {
  name: "",
  industry: INDUSTRY_OPTIONS[0] as string,
  website: "",
  employees: "",
  description: "",
};

function CompanyGridCard({
  card,
  c,
  expanded,
  onToggle,
  onDelete,
}: {
  card: CompanyCard;
  c: CrudCompaniesMessages;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <Card variant="default" className="flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-4 pt-6">
        <div className="flex items-start gap-3">
          <Avatar
            src={placeholderImage(card.avatarSeed, "1x1")}
            alt=""
            fallback={card.name}
            size="md"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-fg truncate text-sm font-semibold">
              {card.name}
            </span>
            <Badge variant="soft" size="sm" className="w-fit">
              <IconBuildingSkyscraper size={11} className="mr-1" />
              {c[card.industryKey]}
            </Badge>
          </div>
        </div>
        <span className="text-muted text-xs">{card.employees}</span>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="text-muted hover:text-fg flex items-center gap-1 text-xs font-medium"
        >
          {expanded
            ? c.crudCompanies3HideDetailsLabel
            : c.crudCompanies3ShowDetailsLabel}
          <IconChevronDown
            size={14}
            className={cn("transition-transform", expanded && "rotate-180")}
          />
        </button>
        {expanded && (
          <div className="border-border flex flex-col gap-2 border-t pt-3">
            <p className="text-muted text-sm leading-relaxed">
              {card.description}
            </p>
            <span className="text-brand text-xs font-medium">
              {card.website}
            </span>
          </div>
        )}
        <div className="mt-auto flex justify-end pt-2">
          <ConfirmDialog
            title={c.crudCompanies3DeleteConfirmTitle}
            description={c.crudCompanies3DeleteConfirmDescription}
            confirmLabel={c.crudCompanies3DeleteConfirmConfirm}
            cancelLabel={c.crudCompanies3DeleteConfirmCancel}
            onConfirm={onDelete}
          >
            {(open) => (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-error hover:text-error"
                leftIcon={<IconTrash size={14} />}
                onClick={open}
              >
                {c.crudCompanies3DeleteLabel}
              </Button>
            )}
          </ConfirmDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompanyGridDialogFormCrudCompanies() {
  const t = useMessages("pages") as unknown as PagesWithCrudCompaniesMessages;
  const c = t.crudCompanies;

  const [cards, setCards] = useState<CompanyCard[]>(() => buildInitialCards(c));
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    const employeesText = draft.employees.trim()
      ? c.crudCompanies3EmployeesTemplate.replace("{n}", draft.employees.trim())
      : c.crudCompanies3EmployeesUnknown;
    setCards((prev) => [
      {
        id: `new-${prev.length + 1}`,
        avatarSeed: `cc3-new-${prev.length + 1}`,
        name: draft.name,
        employees: employeesText,
        website: draft.website || c.crudCompanies3WebsiteFallback,
        description: draft.description || c.crudCompanies3DescriptionFallback,
        industryKey: draft.industry as IndustryKey,
      },
      ...prev,
    ]);
    setDraft(EMPTY_DRAFT);
    setDialogOpen(false);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 className="text-3xl font-medium tracking-tighter md:text-4xl">
              {c.crudCompanies3Heading}
            </h2>
            <p className="text-muted text-base">
              {c.crudCompanies3Description}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger variant="primary">
              <IconPlus size={16} className="mr-1.5" />
              {c.crudCompanies3NewCompanyButton}
            </DialogTrigger>
            <DialogContent size="md">
              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <DialogHeader>
                  <DialogTitle>{c.crudCompanies3DialogTitle}</DialogTitle>
                  <DialogDescription>
                    {c.crudCompanies3DialogDescription}
                  </DialogDescription>
                </DialogHeader>
                <DialogBody className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc3-name">
                      {c.crudCompanies3FieldNameLabel}
                    </Label>
                    <Input
                      id="cc3-name"
                      value={draft.name}
                      placeholder={c.crudCompanies3FieldNamePlaceholder}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc3-industry">
                      {c.crudCompanies3FieldIndustryLabel}
                    </Label>
                    <NativeSelect
                      id="cc3-industry"
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="cc3-website">
                        {c.crudCompanies3FieldWebsiteLabel}
                      </Label>
                      <Input
                        id="cc3-website"
                        value={draft.website}
                        placeholder={c.crudCompanies3FieldWebsitePlaceholder}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            website: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="cc3-employees">
                        {c.crudCompanies3FieldEmployeesLabel}
                      </Label>
                      <Input
                        id="cc3-employees"
                        type="number"
                        min={0}
                        value={draft.employees}
                        placeholder={c.crudCompanies3FieldEmployeesPlaceholder}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            employees: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc3-description">
                      {c.crudCompanies3FieldDescriptionLabel}
                    </Label>
                    <Textarea
                      id="cc3-description"
                      value={draft.description}
                      placeholder={c.crudCompanies3FieldDescriptionPlaceholder}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                    />
                  </div>
                </DialogBody>
                <DialogFooter>
                  <DialogClose type="button">
                    {c.crudCompanies3CancelButton}
                  </DialogClose>
                  <Button type="submit" variant="primary">
                    {c.crudCompanies3SubmitButton}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {cards.length === 0 ? (
          <div className="border-border flex flex-col items-center gap-3 rounded-lg border border-dashed p-12 text-center">
            <p className="text-fg font-medium">{c.crudCompanies3EmptyTitle}</p>
            <p className="text-muted text-sm">
              {c.crudCompanies3EmptyDescription}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <CompanyGridCard
                key={card.id}
                card={card}
                c={c}
                expanded={expandedId === card.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === card.id ? null : card.id))
                }
                onDelete={() =>
                  setCards((prev) => prev.filter((item) => item.id !== card.id))
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
