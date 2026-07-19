"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import {
  Accordion,
  AccordionItemComplex,
} from "@/components/ui/Accordion";
import {
  IconInfoCircle,
  IconSettings,
  IconCircleCheck,
} from "@tabler/icons-react";

export function RichItemsExample() {
  const t = useMessages("accordion");

  return (
    <>
      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">{t.faqWithIcons}</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItemComplex
            value="faq1"
            centerSlot={
              <div>
                <div className="font-semibold text-base">{t.faq1Title}</div>
                <div className="text-muted text-sm mt-1">{t.faq1Desc}</div>
              </div>
            }
            leftSlot={
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-brand-fg">
                <IconInfoCircle size={18} stroke={2.5} />
              </div>
            }
            rightSlot={
              <span className="inline-flex items-center rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-medium text-brand">
                {t.categoryGeneral}
              </span>
            }
            content={
              <div className="space-y-2">
                <p>{t.faq1Content1}</p>
                <p>{t.faq1Content2}</p>
              </div>
            }
          />
          <AccordionItemComplex
            value="faq2"
            centerSlot={
              <div>
                <div className="font-semibold text-base">{t.faq2Title}</div>
                <div className="text-muted text-sm mt-1">{t.faq2Desc}</div>
              </div>
            }
            leftSlot={
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info text-info-fg">
                <IconSettings size={18} stroke={2.5} />
              </div>
            }
            rightSlot={
              <span className="inline-flex items-center rounded-full bg-info/15 px-2.5 py-0.5 text-xs font-medium text-info">
                {t.categoryCustomization}
              </span>
            }
            content={
              <div className="space-y-2">
                <p>{t.faq2Content1}</p>
                <p>{t.faq2Content2}</p>
              </div>
            }
          />
          <AccordionItemComplex
            value="faq3"
            centerSlot={
              <div>
                <div className="font-semibold text-base">{t.faq3Title}</div>
                <div className="text-muted text-sm mt-1">{t.faq3Desc}</div>
              </div>
            }
            leftSlot={
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-success-fg">
                <IconCircleCheck size={18} stroke={2.5} />
              </div>
            }
            rightSlot={
              <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                {t.categoryBehavior}
              </span>
            }
            content={
              <div className="space-y-2">
                <p>{t.faq3Content1}</p>
                <p>{t.faq3Content2}</p>
              </div>
            }
          />
        </Accordion>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">{t.userProfiles}</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItemComplex
            value="user1"
            centerSlot={
              <div>
                <div className="font-semibold text-base">{t.sarahName}</div>
                <div className="text-muted text-sm mt-1">{t.sarahRole}</div>
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
                <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                  {t.statusActive}
                </span>
              </div>
            }
            content={
              <div className="space-y-3">
                <p>{t.sarahBio}</p>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{t.skillFigma}</span>
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{t.skillPrototyping}</span>
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{t.skillUserResearch}</span>
                </div>
              </div>
            }
          />
          <AccordionItemComplex
            value="user2"
            centerSlot={
              <div>
                <div className="font-semibold text-base">{t.mikeName}</div>
                <div className="text-muted text-sm mt-1">{t.mikeRole}</div>
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
                <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                  {t.statusActive}
                </span>
              </div>
            }
            content={
              <div className="space-y-3">
                <p>{t.mikeBio}</p>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{t.skillReact}</span>
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{t.skillTypeScript}</span>
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{t.skillAWS}</span>
                </div>
              </div>
            }
          />
        </Accordion>
      </section>
    </>
  );
}
