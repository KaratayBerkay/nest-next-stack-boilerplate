"use client";

import { useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Careers8Category,
  PagesWithCareersMessages,
} from "@/types/pages/careers/CareersMessages-types";

const LINK_URL = "https://example.com" as const;
const ALL_DEPARTMENTS = "all" as const;

const CATEGORIES: Careers8Category[] = [
  {
    titleKey: "careers8Category1Title",
    jobs: [
      {
        titleKey: "careers8Category1Job1Title",
        locationKey: "careers8Category1Job1Location",
      },
      {
        titleKey: "careers8Category1Job2Title",
        locationKey: "careers8Category1Job2Location",
      },
      {
        titleKey: "careers8Category1Job3Title",
        locationKey: "careers8Category1Job3Location",
      },
      {
        titleKey: "careers8Category1Job4Title",
        locationKey: "careers8Category1Job4Location",
      },
    ],
  },
  {
    titleKey: "careers8Category2Title",
    jobs: [
      {
        titleKey: "careers8Category2Job1Title",
        locationKey: "careers8Category2Job1Location",
      },
      {
        titleKey: "careers8Category2Job2Title",
        locationKey: "careers8Category2Job2Location",
      },
    ],
  },
  {
    titleKey: "careers8Category3Title",
    jobs: [
      {
        titleKey: "careers8Category3Job1Title",
        locationKey: "careers8Category3Job1Location",
      },
      {
        titleKey: "careers8Category3Job2Title",
        locationKey: "careers8Category3Job2Location",
      },
      {
        titleKey: "careers8Category3Job3Title",
        locationKey: "careers8Category3Job3Location",
      },
    ],
  },
  {
    titleKey: "careers8Category4Title",
    jobs: [
      {
        titleKey: "careers8Category4Job1Title",
        locationKey: "careers8Category4Job1Location",
      },
      {
        titleKey: "careers8Category4Job2Title",
        locationKey: "careers8Category4Job2Location",
      },
    ],
  },
  {
    titleKey: "careers8Category5Title",
    jobs: [
      {
        titleKey: "careers8Category5Job1Title",
        locationKey: "careers8Category5Job1Location",
      },
      {
        titleKey: "careers8Category5Job2Title",
        locationKey: "careers8Category5Job2Location",
      },
    ],
  },
];

const FILTER_OPTIONS = CATEGORIES.map((category) => category.titleKey);

function handleFilterChange(
  event: ChangeEvent<HTMLSelectElement>,
  setSelected: Dispatch<SetStateAction<string>>,
) {
  setSelected(event.target.value);
}

function getFilteredCategories(
  selected: string,
  categories: Careers8Category[],
): Careers8Category[] {
  if (selected === ALL_DEPARTMENTS) return categories;
  return categories.filter((category) => category.titleKey === selected);
}

export function FilterableDepCardGrid() {
  const t = useMessages("pages") as unknown as PagesWithCareersMessages;
  const careers = t.careers;
  const [selected, setSelected] = useState<string>(ALL_DEPARTMENTS);
  const filteredCategories = getFilteredCategories(selected, CATEGORIES);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {careers.careers8Heading}
          </Typography>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="careers8-department-filter"
              className="text-sm font-medium"
            >
              {careers.careers8FilterLabel}
            </label>
            <NativeSelect
              id="careers8-department-filter"
              value={selected}
              onChange={(event) => handleFilterChange(event, setSelected)}
            >
              <option value={ALL_DEPARTMENTS}>
                {careers.careers8AllDepartments}
              </option>
              {FILTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {careers[option]}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        <div className="flex flex-col gap-12">
          {filteredCategories.map((category) => (
            <div key={category.titleKey} className="flex flex-col gap-6">
              <Typography
                variant="h3"
                className="text-2xl font-medium tracking-tighter md:text-3xl"
              >
                {careers[category.titleKey]}
              </Typography>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.jobs.map((job) => (
                  <a
                    key={job.titleKey}
                    href={LINK_URL}
                    className="bg-surface hover:bg-surface-hover flex flex-col gap-1.5 rounded-2xl p-6 transition-colors"
                  >
                    <span className="font-medium">{careers[job.titleKey]}</span>
                    <span className="text-muted text-sm">
                      {careers[job.locationKey]}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
