"use client";

import { useState } from "react";
import Image from "next/image";
import { IconUsersGroup } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFieldMappingMessages } from "@/types/pages/field-mapping/FieldMappingMessages-types";

const RECORDS = [
  {
    id: "a",
    src: "/img/placeholders/ph-1x1-2.webp",
    nameKey: "fieldMapping2RecordAName",
    emailKey: "fieldMapping2RecordAEmail",
  },
  {
    id: "b",
    src: "/img/placeholders/ph-1x1-5.webp",
    nameKey: "fieldMapping2RecordBName",
    emailKey: "fieldMapping2RecordBEmail",
  },
] as const;

const CONFLICT_FIELDS = [
  {
    id: "phone",
    labelKey: "fieldMapping2FieldPhone",
    valueAKey: "fieldMapping2PhoneA",
    valueBKey: "fieldMapping2PhoneB",
  },
  {
    id: "company",
    labelKey: "fieldMapping2FieldCompany",
    valueAKey: "fieldMapping2CompanyA",
    valueBKey: "fieldMapping2CompanyB",
  },
  {
    id: "role",
    labelKey: "fieldMapping2FieldRole",
    valueAKey: "fieldMapping2RoleA",
    valueBKey: "fieldMapping2RoleB",
  },
] as const;

export function RecordMergeDialog() {
  const t = useMessages("pages") as unknown as PagesWithFieldMappingMessages;
  const fm = t.fieldMapping;
  const [picks, setPicks] = useState<Record<string, "a" | "b">>({
    phone: "a",
    company: "a",
    role: "b",
  });

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 lg:px-8">
        <Dialog>
          <DialogTrigger
            variant="outline"
            className="inline-flex items-center gap-2"
          >
            <IconUsersGroup size={18} aria-hidden="true" />
            {fm.fieldMapping2Trigger}
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{fm.fieldMapping2Heading}</DialogTitle>
              <DialogDescription>
                {fm.fieldMapping2Description}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-5 px-6 pb-2">
              <div className="grid grid-cols-2 gap-3">
                {RECORDS.map((record) => (
                  <div
                    key={record.id}
                    className="border-border bg-surface flex flex-col items-center gap-2 rounded-lg border p-4 text-center"
                  >
                    <Image
                      src={record.src}
                      alt=""
                      aria-hidden="true"
                      width={40}
                      height={40}
                      className="size-10 rounded-full object-cover"
                    />
                    <span className="text-fg text-sm font-semibold">
                      {fm[record.nameKey]}
                    </span>
                    <span className="text-muted text-xs">
                      {fm[record.emailKey]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                {CONFLICT_FIELDS.map((field) => (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <span className="text-muted text-xs font-medium tracking-wide uppercase">
                      {fm[field.labelKey]}
                    </span>
                    <RadioGroup
                      value={picks[field.id]}
                      onValueChange={(value) =>
                        setPicks((current) => ({
                          ...current,
                          [field.id]: value as "a" | "b",
                        }))
                      }
                      className="grid grid-cols-2 gap-2"
                    >
                      <label
                        htmlFor={`merge-${field.id}-a`}
                        className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border flex cursor-pointer items-center gap-2 rounded-md border p-2.5"
                      >
                        <RadioGroupItem value="a" id={`merge-${field.id}-a`} />
                        <span className="truncate text-sm">
                          {fm[field.valueAKey]}
                        </span>
                      </label>
                      <label
                        htmlFor={`merge-${field.id}-b`}
                        className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border flex cursor-pointer items-center gap-2 rounded-md border p-2.5"
                      >
                        <RadioGroupItem value="b" id={`merge-${field.id}-b`} />
                        <span className="truncate text-sm">
                          {fm[field.valueBKey]}
                        </span>
                      </label>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <DialogClose variant="ghost">
                {fm.fieldMapping2Cancel}
              </DialogClose>
              <Button variant="primary">{fm.fieldMapping2Merge}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
