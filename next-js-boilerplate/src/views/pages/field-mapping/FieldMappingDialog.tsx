"use client";

import { useState } from "react";
import { IconFileSpreadsheet, IconArrowRight } from "@tabler/icons-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFieldMappingMessages } from "@/types/pages/field-mapping/FieldMappingMessages-types";

const TARGET_FIELDS = [
  { value: "name", labelKey: "fieldMapping1TargetName" },
  { value: "email", labelKey: "fieldMapping1TargetEmail" },
  { value: "company", labelKey: "fieldMapping1TargetCompany" },
  { value: "skip", labelKey: "fieldMapping1TargetSkip" },
] as const;

const ROWS = [
  { id: "col1", columnKey: "fieldMapping1Column1", defaultTarget: "name" },
  { id: "col2", columnKey: "fieldMapping1Column2", defaultTarget: "email" },
  { id: "col3", columnKey: "fieldMapping1Column3", defaultTarget: "company" },
  { id: "col4", columnKey: "fieldMapping1Column4", defaultTarget: "skip" },
] as const;

export function FieldMappingDialog() {
  const t = useMessages("pages") as unknown as PagesWithFieldMappingMessages;
  const fm = t.fieldMapping;
  const [targets, setTargets] = useState<Record<string, string>>(() =>
    Object.fromEntries(ROWS.map((row) => [row.id, row.defaultTarget])),
  );

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 lg:px-8">
        <Dialog>
          <DialogTrigger
            variant="outline"
            className="inline-flex items-center gap-2"
          >
            <IconFileSpreadsheet size={18} aria-hidden="true" />
            {fm.fieldMapping1Trigger}
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{fm.fieldMapping1Heading}</DialogTitle>
              <DialogDescription>
                {fm.fieldMapping1Description}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 px-6 pb-2">
              <div className="text-muted flex items-center justify-between text-xs font-medium tracking-wide uppercase">
                <span>{fm.fieldMapping1ColumnHeader}</span>
                <span>{fm.fieldMapping1FieldHeader}</span>
              </div>
              {ROWS.map((row) => (
                <div key={row.id} className="flex items-center gap-3">
                  <span className="border-border bg-surface text-fg flex-1 truncate rounded-md border px-3 py-2 text-sm">
                    {fm[row.columnKey]}
                  </span>
                  <IconArrowRight
                    size={14}
                    className="text-muted shrink-0"
                    aria-hidden="true"
                  />
                  <Select
                    value={targets[row.id]}
                    onValueChange={(value) =>
                      setTargets((current) => ({ ...current, [row.id]: value }))
                    }
                    name={`field-mapping-${row.id}`}
                  >
                    <SelectTrigger className="w-40 shrink-0">
                      {
                        fm[
                          TARGET_FIELDS.find((f) => f.value === targets[row.id])
                            ?.labelKey ?? "fieldMapping1TargetSkip"
                        ]
                      }
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_FIELDS.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {fm[field.labelKey]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <DialogFooter>
              <DialogClose variant="ghost">
                {fm.fieldMapping1Cancel}
              </DialogClose>
              <Button variant="primary">{fm.fieldMapping1Import}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
