"use client";

import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCaseStudyMessages } from "@/types/pages/case-study/CaseStudyMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const NAV_SECTIONS = [
  {
    id: "overview",
    navLabelKey: "caseStudy3NavOverviewLabel",
    headingKey: "caseStudy3OverviewHeading",
    bodyKey: "caseStudy3OverviewBody",
  },
  {
    id: "strategy",
    navLabelKey: "caseStudy3NavStrategyLabel",
    headingKey: "caseStudy3StrategyHeading",
    bodyKey: "caseStudy3StrategyBody",
  },
  {
    id: "results",
    navLabelKey: "caseStudy3NavResultsLabel",
    headingKey: "caseStudy3ResultsHeading",
    bodyKey: "caseStudy3ResultsBody",
  },
  {
    id: "team",
    navLabelKey: "caseStudy3NavTeamLabel",
    headingKey: "caseStudy3TeamHeading",
    bodyKey: "caseStudy3TeamBody",
  },
] as const;

const STRATEGY_TAGS = [
  "caseStudy3StrategyTag1",
  "caseStudy3StrategyTag2",
  "caseStudy3StrategyTag3",
  "caseStudy3StrategyTag4",
] as const;

const RESULT_STATS = [
  { valueKey: "caseStudy3ResultsStat1Value", labelKey: "caseStudy3ResultsStat1Label" },
  { valueKey: "caseStudy3ResultsStat2Value", labelKey: "caseStudy3ResultsStat2Label" },
  { valueKey: "caseStudy3ResultsStat3Value", labelKey: "caseStudy3ResultsStat3Label" },
] as const;

const TEAM_MEMBERS = [
  { seed: "case-study-3-member-1", nameKey: "caseStudy3Member1Name", roleKey: "caseStudy3Member1Role" },
  { seed: "case-study-3-member-2", nameKey: "caseStudy3Member2Name", roleKey: "caseStudy3Member2Role" },
  { seed: "case-study-3-member-3", nameKey: "caseStudy3Member3Name", roleKey: "caseStudy3Member3Role" },
  { seed: "case-study-3-member-4", nameKey: "caseStudy3Member4Name", roleKey: "caseStudy3Member4Role" },
] as const;

export function SectionNavAvatarsCaseStudy() {
  const t = useMessages("pages") as unknown as PagesWithCaseStudyMessages;
  const cs = t.caseStudy;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-start gap-4 pb-10">
          <Badge variant="outline">{cs.caseStudy3Eyebrow}</Badge>
          <h1 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {cs.caseStudy3Title}
          </h1>
          <div className="flex items-center gap-3">
            <AvatarGroup max={4}>
              {TEAM_MEMBERS.map((member) => (
                <Avatar
                  key={member.seed}
                  src={placeholderImage(member.seed, "1x1")}
                  alt={cs[member.nameKey]}
                  fallback={cs[member.nameKey].slice(0, 2)}
                  size="sm"
                />
              ))}
            </AvatarGroup>
            <span className="text-muted text-sm">
              {cs.caseStudy3TeamCaption}
            </span>
          </div>
        </div>

        <Tabs defaultValue={NAV_SECTIONS[0].id} orientation="vertical">
          <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
            <TabsList className="flex flex-col items-start gap-1 lg:sticky lg:top-24">
              {NAV_SECTIONS.map((section, index) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="w-full justify-start gap-3"
                >
                  <span className="text-muted text-xs tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {cs[section.navLabelKey]}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="min-w-0">
              {NAV_SECTIONS.map((section) => (
                <TabsContent
                  key={section.id}
                  value={section.id}
                  className="flex flex-col gap-5"
                >
                  <h2 className="text-fg text-2xl font-semibold tracking-tight">
                    {cs[section.headingKey]}
                  </h2>
                  <p className="text-muted leading-relaxed">
                    {cs[section.bodyKey]}
                  </p>

                  {section.id === "strategy" && (
                    <div className="flex flex-wrap gap-2">
                      {STRATEGY_TAGS.map((key) => (
                        <Badge key={key} variant="secondary">
                          {cs[key]}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {section.id === "results" && (
                    <div className="flex flex-wrap gap-8">
                      {RESULT_STATS.map((stat) => (
                        <div key={stat.labelKey} className="flex flex-col gap-1">
                          <span className="text-fg text-3xl font-semibold tracking-tight">
                            {cs[stat.valueKey]}
                          </span>
                          <span className="text-muted text-sm">
                            {cs[stat.labelKey]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.id === "team" && (
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                      {TEAM_MEMBERS.map((member) => (
                        <div
                          key={member.seed}
                          className="flex flex-col items-center gap-2 text-center"
                        >
                          <Avatar
                            src={placeholderImage(member.seed, "1x1")}
                            alt={cs[member.nameKey]}
                            fallback={cs[member.nameKey].slice(0, 2)}
                            size="lg"
                          />
                          <div className="flex flex-col">
                            <span className="text-fg text-sm font-medium">
                              {cs[member.nameKey]}
                            </span>
                            <span className="text-muted text-xs">
                              {cs[member.roleKey]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
