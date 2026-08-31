"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { IconClock } from "@tabler/icons-react";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithBlogPostMessages } from "@/types/pages/blog-post/BlogPostMessages-types";

const SECTIONS = [
  {
    headingKey: "blogPost10Section1Heading",
    paragraphKeys: [
      "blogPost10Section1Paragraph1",
      "blogPost10Section1Paragraph2",
    ],
  },
  {
    headingKey: "blogPost10Section2Heading",
    paragraphKeys: [
      "blogPost10Section2Paragraph1",
      "blogPost10Section2Paragraph2",
    ],
  },
  {
    headingKey: "blogPost10Section3Heading",
    paragraphKeys: ["blogPost10Section3Paragraph"],
  },
  {
    headingKey: "blogPost10Section4Heading",
    paragraphKeys: ["blogPost10Section4Paragraph"],
  },
] as const;

function updateProgress(
  scrollTop: number,
  docHeight: number,
  setProgress: Dispatch<SetStateAction<number>>,
) {
  const maxScroll = Math.max(docHeight - window.innerHeight, 1);
  const progress = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
  setProgress(progress);
}

export function WithProgressBarArticle() {
  const t = (useMessages("pages") as unknown as PagesWithBlogPostMessages)
    .blogPost;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateProgress(
          window.scrollY,
          document.documentElement.scrollHeight,
          setProgress,
        );
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="w-full py-16 lg:py-24">
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t.blogPost10ProgressLabel}
        className="bg-surface fixed inset-x-0 top-0 z-50 h-1"
      >
        <div className="bg-brand h-full" style={{ width: `${progress}%` }} />
      </div>

      <div className="mx-auto flex max-w-2xl flex-col gap-10 px-4 lg:px-8">
        <div className="flex flex-col gap-4">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {t.blogPost10Category}
          </span>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blogPost10Heading}
          </Typography>
          <span className="text-muted flex items-center gap-1.5 text-sm">
            <IconClock size={14} />
            {t.blogPost10ReadTime}
          </span>
        </div>

        <div className="flex flex-col gap-10">
          {SECTIONS.map((section) => (
            <div key={section.headingKey} className="flex flex-col gap-4">
              <Typography
                variant="h3"
                className="text-2xl font-medium tracking-tighter"
              >
                {t[section.headingKey]}
              </Typography>
              {section.paragraphKeys.map((key) => (
                <Typography key={key} variant="body" className="text-muted">
                  {t[key]}
                </Typography>
              ))}
            </div>
          ))}
        </div>

        <Separator />

        <Typography variant="bodySmall" className="text-muted italic">
          {t.blogPost10Closing}
        </Typography>
      </div>
    </section>
  );
}
