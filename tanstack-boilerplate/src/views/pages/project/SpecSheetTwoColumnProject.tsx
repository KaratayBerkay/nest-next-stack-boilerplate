"use client";

import { IconCircleCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/Table";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProjectMessages } from "@/types/pages/project/ProjectMessages-types";

interface SpecRow {
  labelKey: string;
  valueKey: string;
}

const SPEC_ROWS: SpecRow[] = [
  { labelKey: "project3SpecRoleLabel", valueKey: "project3SpecRoleValue" },
  { labelKey: "project3SpecClientLabel", valueKey: "project3SpecClientValue" },
  {
    labelKey: "project3SpecIndustryLabel",
    valueKey: "project3SpecIndustryValue",
  },
  {
    labelKey: "project3SpecTimelineLabel",
    valueKey: "project3SpecTimelineValue",
  },
  {
    labelKey: "project3SpecBudgetLabel",
    valueKey: "project3SpecBudgetValue",
  },
  {
    labelKey: "project3SpecPlatformLabel",
    valueKey: "project3SpecPlatformValue",
  },
];

const DELIVERABLE_KEYS = [
  "project3Deliverable1",
  "project3Deliverable2",
  "project3Deliverable3",
  "project3Deliverable4",
] as const;

const STACK_KEYS = [
  "project3Stack1",
  "project3Stack2",
  "project3Stack3",
  "project3Stack4",
  "project3Stack5",
  "project3Stack6",
] as const;

export function SpecSheetTwoColumnProject() {
  const t = useMessages("pages") as unknown as PagesWithProjectMessages;
  const p = t.project;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-border pb-10">
          <Badge variant="soft">{p.project3Eyebrow}</Badge>
          <h1 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.project3Title}
          </h1>
          <p className="text-muted max-w-2xl text-lg leading-relaxed">
            {p.project3Intro}
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <h2 className="text-fg text-xl font-semibold">
                {p.project3ProblemHeading}
              </h2>
              <p className="text-muted leading-relaxed">
                {p.project3ProblemBody}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-fg text-xl font-semibold">
                {p.project3SolutionHeading}
              </h2>
              <p className="text-muted leading-relaxed">
                {p.project3SolutionBody}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-fg text-xl font-semibold">
                {p.project3DeliverablesHeading}
              </h2>
              <ul className="flex flex-col gap-2">
                {DELIVERABLE_KEYS.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm">
                    <IconCircleCheck
                      size={16}
                      className="text-brand mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-muted">{p[key]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-fg text-xl font-semibold">
                {p.project3SpecsHeading}
              </h2>
              <Table>
                <TableBody>
                  {SPEC_ROWS.map((row) => (
                    <TableRow key={row.labelKey}>
                      <TableCell className="text-muted w-1/3 font-medium">
                        {p[row.labelKey]}
                      </TableCell>
                      <TableCell className="text-fg">
                        {p[row.valueKey]}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-muted text-xs">{p.project3StackLabel}</span>
              <div className="flex flex-wrap gap-2">
                {STACK_KEYS.map((key) => (
                  <Badge key={key} variant="secondary">
                    {p[key]}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
