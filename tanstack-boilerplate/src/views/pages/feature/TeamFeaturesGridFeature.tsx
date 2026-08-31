"use client";

import Image from "next/image";
import { IconCheck } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const MEMBERS = [
  {
    nameKey: "feature241Member1Name",
    roleKey: "feature241Member1Role",
    avatarAltKey: "feature241Member1AvatarAlt",
    skillKeys: [
      "feature241Member1Skill1",
      "feature241Member1Skill2",
      "feature241Member1Skill3",
    ],
    src: "/img/placeholders/ph-1x1-4.webp",
  },
  {
    nameKey: "feature241Member2Name",
    roleKey: "feature241Member2Role",
    avatarAltKey: "feature241Member2AvatarAlt",
    skillKeys: [
      "feature241Member2Skill1",
      "feature241Member2Skill2",
      "feature241Member2Skill3",
    ],
    src: "/img/placeholders/ph-1x1-4.webp",
  },
  {
    nameKey: "feature241Member3Name",
    roleKey: "feature241Member3Role",
    avatarAltKey: "feature241Member3AvatarAlt",
    skillKeys: [
      "feature241Member3Skill1",
      "feature241Member3Skill2",
      "feature241Member3Skill3",
    ],
    src: "/img/placeholders/ph-1x1-0.webp",
  },
  {
    nameKey: "feature241Member4Name",
    roleKey: "feature241Member4Role",
    avatarAltKey: "feature241Member4AvatarAlt",
    skillKeys: [
      "feature241Member4Skill1",
      "feature241Member4Skill2",
      "feature241Member4Skill3",
    ],
    src: "/img/placeholders/ph-1x1-1.webp",
  },
] as const;

export function TeamFeaturesGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature241Heading}
          </h2>
          <p className="text-muted">{f.feature241Intro}</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBERS.map((member) => (
            <article
              key={member.nameKey}
              className="border-border bg-surface flex flex-col gap-5 rounded-lg border p-6"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={member.src}
                  alt={f[member.avatarAltKey]}
                  width={160}
                  height={160}
                  className="size-16 rounded-full object-cover"
                />
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-fg text-base font-semibold">
                    {f[member.nameKey]}
                  </h3>
                  <span className="text-muted text-xs">
                    {f[member.roleKey]}
                  </span>
                </div>
              </div>
              <div className="border-border h-px w-full border-t border-dashed" />
              <ul className="flex flex-col gap-2.5">
                {member.skillKeys.map((skillKey) => (
                  <li key={skillKey} className="flex items-start gap-2.5">
                    <IconCheck size={16} className="mt-0.5 shrink-0" />
                    <span className="text-muted text-sm">{f[skillKey]}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
