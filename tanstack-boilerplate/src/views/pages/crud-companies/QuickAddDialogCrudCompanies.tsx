"use client";

import { useState } from "react";
import { IconBuildingSkyscraper, IconPlus, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
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
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCrudCompaniesMessages } from "@/types/pages/crud-companies/CrudCompaniesMessages-types";

interface AddedCompany {
  id: string;
  name: string;
  website: string;
}

const EMPTY_DRAFT = { name: "", website: "", email: "" };

export function QuickAddDialogCrudCompanies() {
  const t = useMessages("pages") as unknown as PagesWithCrudCompaniesMessages;
  const c = t.crudCompanies;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [added, setAdded] = useState<AddedCompany[]>([]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    setAdded((prev) => [
      { id: `${Date.now()}`, name: draft.name, website: draft.website },
      ...prev,
    ]);
    setDraft(EMPTY_DRAFT);
    setOpen(false);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-8 px-6 text-center lg:px-8">
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-medium tracking-tighter md:text-4xl">
            {c.crudCompanies4Heading}
          </h2>
          <p className="text-muted text-base">{c.crudCompanies4Description}</p>
        </div>

        <Card variant="default" className="w-full">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <span className="bg-brand/10 text-brand inline-flex size-12 items-center justify-center rounded-full">
              <IconBuildingSkyscraper size={22} />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-fg text-base font-semibold">
                {c.crudCompanies4CtaTitle}
              </span>
              <span className="text-muted text-sm">
                {c.crudCompanies4CtaDescription}
              </span>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger variant="primary" size="sm">
                <IconPlus size={15} className="mr-1.5" />
                {c.crudCompanies4CtaButton}
              </DialogTrigger>
              <DialogContent size="sm">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{c.crudCompanies4DialogTitle}</DialogTitle>
                    <DialogDescription>
                      {c.crudCompanies4DialogDescription}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogBody className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5 text-left">
                      <Label htmlFor="cc4-name">
                        {c.crudCompanies4FieldNameLabel}
                      </Label>
                      <Input
                        id="cc4-name"
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                        value={draft.name}
                        placeholder={c.crudCompanies4FieldNamePlaceholder}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <Label htmlFor="cc4-website">
                        {c.crudCompanies4FieldWebsiteLabel}
                      </Label>
                      <Input
                        id="cc4-website"
                        value={draft.website}
                        placeholder={c.crudCompanies4FieldWebsitePlaceholder}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            website: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <Label htmlFor="cc4-email">
                        {c.crudCompanies4FieldEmailLabel}
                      </Label>
                      <Input
                        id="cc4-email"
                        type="email"
                        value={draft.email}
                        placeholder={c.crudCompanies4FieldEmailPlaceholder}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose type="button">
                      {c.crudCompanies4CancelButton}
                    </DialogClose>
                    <Button type="submit" variant="primary">
                      {c.crudCompanies4SubmitButton}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <div className="flex w-full flex-col gap-2">
          <span className="text-muted text-xs font-medium tracking-wider uppercase">
            {c.crudCompanies4AddedListTitle}
          </span>
          {added.length === 0 ? (
            <p className="text-muted text-sm">
              {c.crudCompanies4AddedEmptyHint}
            </p>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              {added.map((item) => (
                <Badge
                  key={item.id}
                  variant="secondary"
                  className="gap-1.5 pr-1.5"
                >
                  {item.name}
                  <button
                    type="button"
                    aria-label={c.crudCompanies4RemoveAria}
                    onClick={() =>
                      setAdded((prev) => prev.filter((i) => i.id !== item.id))
                    }
                    className="hover:bg-surface-hover ml-0.5 inline-flex size-4 items-center justify-center rounded-full"
                  >
                    <IconX size={11} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
