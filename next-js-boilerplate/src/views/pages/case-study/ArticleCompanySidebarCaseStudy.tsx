"use client";

import Image from "next/image";
import { IconChevronDown, IconCircleCheck } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Quote } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCaseStudyMessages } from "@/types/pages/case-study/CaseStudyMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const COMPANY_INFO = [
  { labelKey: "caseStudy8FoundedLabel", valueKey: "caseStudy8FoundedValue" },
  { labelKey: "caseStudy8SizeLabel", valueKey: "caseStudy8SizeValue" },
  { labelKey: "caseStudy8HqLabel", valueKey: "caseStudy8HqValue" },
  { labelKey: "caseStudy8WebsiteLabel", valueKey: "caseStudy8WebsiteValue" },
] as const;

const SERVICES = [
  "caseStudy8Service1",
  "caseStudy8Service2",
  "caseStudy8Service3",
] as const;

export function ArticleCompanySidebarCaseStudy() {
  const t = useMessages("pages") as unknown as PagesWithCaseStudyMessages;
  const cs = t.caseStudy;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:gap-14">
          <article className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{cs.caseStudy8Tag1}</Badge>
              <Badge variant="outline">{cs.caseStudy8Tag2}</Badge>
            </div>

            <h1 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {cs.caseStudy8Title}
            </h1>

            <div className="flex items-center gap-3">
              <Avatar
                src={placeholderImage("case-study-8-author", "1x1")}
                alt={cs.caseStudy8AuthorName}
                fallback={cs.caseStudy8AuthorName.slice(0, 2)}
                size="sm"
              />
              <div className="flex flex-col">
                <span className="text-fg text-sm font-medium">
                  {cs.caseStudy8AuthorName}
                </span>
                <span className="text-muted text-xs">
                  {cs.caseStudy8PublishMeta}
                </span>
              </div>
            </div>

            <div className="border-border bg-surface overflow-hidden rounded-2xl border">
              <AspectRatio ratio={16 / 9}>
                <Image
                  src={placeholderImage("case-study-8-hero", "16x9")}
                  alt={cs.caseStudy8HeroAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              </AspectRatio>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-muted leading-relaxed">{cs.caseStudy8Intro}</p>
              <h2 className="text-fg text-xl font-semibold">
                {cs.caseStudy8Heading1}
              </h2>
              <p className="text-muted leading-relaxed">{cs.caseStudy8Body1}</p>
              <Quote className="text-fg">
                <p className="text-lg font-medium">{cs.caseStudy8QuoteText}</p>
                <footer className="text-muted mt-2 text-sm not-italic">
                  {cs.caseStudy8QuoteAttribution}
                </footer>
              </Quote>
              <h2 className="text-fg text-xl font-semibold">
                {cs.caseStudy8Heading2}
              </h2>
              <p className="text-muted leading-relaxed">{cs.caseStudy8Body2}</p>
            </div>
          </article>

          <aside>
            <div className="flex flex-col gap-6 lg:sticky lg:top-24">
              <Card variant="default">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar
                      variant="brand"
                      fallback={cs.caseStudy8CompanyName.slice(0, 2)}
                      size="lg"
                    />
                    <div className="flex flex-col">
                      <CardTitle>{cs.caseStudy8CompanyName}</CardTitle>
                      <CardDescription>
                        {cs.caseStudy8CompanyTagline}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {COMPANY_INFO.map((row) => (
                      <div key={row.labelKey} className="flex flex-col gap-0.5">
                        <span className="text-muted text-xs">
                          {cs[row.labelKey]}
                        </span>
                        <span className="text-fg text-sm font-medium">
                          {cs[row.valueKey]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center"
                  >
                    {cs.caseStudy8VisitCta}
                  </Button>
                </CardFooter>
              </Card>

              <Accordion
                type="single"
                collapsible
                defaultValue="services"
                className="flex flex-col gap-3"
              >
                <AccordionItem
                  value="services"
                  className="border-border rounded-2xl border"
                >
                  <AccordionTrigger className="group gap-4 px-5">
                    <span className="flex-1 text-left">
                      {cs.caseStudy8ServicesToggle}
                    </span>
                    <IconChevronDown
                      className="text-muted size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                      aria-hidden="true"
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-5">
                    <ul className="flex flex-col gap-2">
                      {SERVICES.map((key) => (
                        <li key={key} className="flex items-center gap-2">
                          <IconCircleCheck
                            size={14}
                            className="text-brand shrink-0"
                            aria-hidden="true"
                          />
                          {cs[key]}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="scope"
                  className="border-border rounded-2xl border"
                >
                  <AccordionTrigger className="group gap-4 px-5">
                    <span className="flex-1 text-left">
                      {cs.caseStudy8ScopeToggle}
                    </span>
                    <IconChevronDown
                      className="text-muted size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                      aria-hidden="true"
                    />
                  </AccordionTrigger>
                  <AccordionContent className="px-5">
                    {cs.caseStudy8ScopeBody}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
