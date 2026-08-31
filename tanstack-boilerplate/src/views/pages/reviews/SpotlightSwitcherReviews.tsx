"use client";

import { useState } from "react";
import { IconQuote, IconStar, IconStarFilled } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithReviewsMessages } from "@/types/pages/reviews/ReviewsMessages-types";

interface SpotlightPerson {
  id: string;
  initials: string;
  rating: number;
  nameKey: string;
  roleKey: string;
  quoteKey: string;
}

const PEOPLE: SpotlightPerson[] = [
  {
    id: "person-1",
    initials: "ND",
    rating: 5,
    nameKey: "reviews2Person1Name",
    roleKey: "reviews2Person1Role",
    quoteKey: "reviews2Person1Quote",
  },
  {
    id: "person-2",
    initials: "LT",
    rating: 5,
    nameKey: "reviews2Person2Name",
    roleKey: "reviews2Person2Role",
    quoteKey: "reviews2Person2Quote",
  },
  {
    id: "person-3",
    initials: "RK",
    rating: 4,
    nameKey: "reviews2Person3Name",
    roleKey: "reviews2Person3Role",
    quoteKey: "reviews2Person3Quote",
  },
  {
    id: "person-4",
    initials: "SW",
    rating: 5,
    nameKey: "reviews2Person4Name",
    roleKey: "reviews2Person4Role",
    quoteKey: "reviews2Person4Quote",
  },
  {
    id: "person-5",
    initials: "MA",
    rating: 5,
    nameKey: "reviews2Person5Name",
    roleKey: "reviews2Person5Role",
    quoteKey: "reviews2Person5Quote",
  },
  {
    id: "person-6",
    initials: "JF",
    rating: 4,
    nameKey: "reviews2Person6Name",
    roleKey: "reviews2Person6Role",
    quoteKey: "reviews2Person6Quote",
  },
];

export function SpotlightSwitcherReviews() {
  const t = useMessages("pages") as unknown as PagesWithReviewsMessages;
  const rv = t.reviews;
  const [activeId, setActiveId] = useState(PEOPLE[0].id);

  const active = PEOPLE.find((person) => person.id === activeId) ?? PEOPLE[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {rv.reviews2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {rv.reviews2Heading}
          </h2>
          <p className="text-muted leading-relaxed">{rv.reviews2Intro}</p>
        </div>

        <div className="border-border bg-surface relative mt-10 rounded-2xl border p-8 lg:p-12">
          <IconQuote
            size={40}
            aria-hidden="true"
            className="text-brand/20 absolute top-6 left-6"
          />
          <div className="relative flex flex-col items-center gap-6 text-center">
            <div
              className="flex items-center gap-0.5"
              role="img"
              aria-label={rv.reviews2RatingAriaTemplate
                .replace("{name}", rv[active.nameKey])
                .replace("{rating}", String(active.rating))}
            >
              {[1, 2, 3, 4, 5].map((n) =>
                n <= active.rating ? (
                  <IconStarFilled
                    key={n}
                    size={16}
                    aria-hidden="true"
                    className="text-warning"
                  />
                ) : (
                  <IconStar
                    key={n}
                    size={16}
                    aria-hidden="true"
                    className="text-border"
                  />
                ),
              )}
            </div>
            <p className="text-fg max-w-xl text-xl leading-relaxed font-medium lg:text-2xl">
              {rv[active.quoteKey]}
            </p>
            <div className="flex items-center gap-3">
              <Avatar fallback={active.initials} size="md" variant="brand" />
              <div className="text-left">
                <p className="text-fg text-sm font-semibold">
                  {rv[active.nameKey]}
                </p>
                <p className="text-muted text-xs">{rv[active.roleKey]}</p>
              </div>
            </div>
          </div>
        </div>

        <ul
          className="mt-8 flex flex-wrap justify-center gap-3"
          aria-label={rv.reviews2SwitchListAria}
        >
          {PEOPLE.map((person) => {
            const isActive = person.id === activeId;
            return (
              <li key={person.id}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveId(person.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-left transition-colors",
                    isActive
                      ? "border-brand bg-brand/10"
                      : "border-border hover:bg-surface-hover",
                  )}
                >
                  <Avatar fallback={person.initials} size="xs" />
                  <span className="text-fg text-xs font-medium whitespace-nowrap">
                    {rv[person.nameKey]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
