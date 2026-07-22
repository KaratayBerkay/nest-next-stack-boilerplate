"use client";

import { Accordion, AccordionItemComplex } from "@/components/ui/Accordion";

export function UserProfileSection(t: Record<string, string>) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">{t.userProfiles}</h3>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItemComplex
          value="user1"
          centerSlot={
            <div>
              <div className="text-base font-semibold">{t.sarahName}</div>
              <div className="text-muted mt-1 text-sm">{t.sarahRole}</div>
            </div>
          }
          leftSlot={
            // eslint-disable-next-line @next/next/no-img-element -- external demo avatar URL, next/image requires host config
            <img
              src="https://i.pravatar.cc/150?u=sarah"
              alt={t.sarahName}
              className="h-10 w-10 rounded-full object-cover"
            />
          }
          rightSlot={
            <div className="flex items-center gap-2">
              <span className="bg-success/10 text-success inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                {t.statusActive}
              </span>
            </div>
          }
          content={
            <div className="space-y-3">
              <p>{t.sarahBio}</p>
              <div className="flex gap-2">
                <span className="bg-muted inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {t.skillFigma}
                </span>
                <span className="bg-muted inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {t.skillPrototyping}
                </span>
                <span className="bg-muted inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {t.skillUserResearch}
                </span>
              </div>
            </div>
          }
        />
        <AccordionItemComplex
          value="user2"
          centerSlot={
            <div>
              <div className="text-base font-semibold">{t.mikeName}</div>
              <div className="text-muted mt-1 text-sm">{t.mikeRole}</div>
            </div>
          }
          leftSlot={
            // eslint-disable-next-line @next/next/no-img-element -- external demo avatar URL, next/image requires host config
            <img
              src="https://i.pravatar.cc/150?u=mike"
              alt={t.mikeName}
              className="h-10 w-10 rounded-full object-cover"
            />
          }
          rightSlot={
            <div className="flex items-center gap-2">
              <span className="bg-success/10 text-success inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                {t.statusActive}
              </span>
            </div>
          }
          content={
            <div className="space-y-3">
              <p>{t.mikeBio}</p>
              <div className="flex gap-2">
                <span className="bg-muted inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {t.skillReact}
                </span>
                <span className="bg-muted inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {t.skillTypeScript}
                </span>
                <span className="bg-muted inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {t.skillAWS}
                </span>
              </div>
            </div>
          }
        />
      </Accordion>
    </section>
  );
}
