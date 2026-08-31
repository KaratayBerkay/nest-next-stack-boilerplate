"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { WithCenteredAlertArticle } from "./WithCenteredAlertArticle";
import { WithStickySidebarArticle } from "./WithStickySidebarArticle";
import { WithStickyNavPromoArticle } from "./WithStickyNavPromoArticle";
import { WithBreadcrumbShareArticle } from "./WithBreadcrumbShareArticle";
import { WithOffsetRailArticle } from "./WithOffsetRailArticle";
import { WithChapterListArticle } from "./WithChapterListArticle";
import { WithAnimatedHeaderArticle } from "./WithAnimatedHeaderArticle";
import { WithSidebarTocArticle } from "./WithSidebarTocArticle";
import { WithAuthorBioArticle } from "./WithAuthorBioArticle";
import { WithProgressBarArticle } from "./WithProgressBarArticle";
import { WithSplitHeroQuoteArticle } from "./WithSplitHeroQuoteArticle";
import { WithDropCapArticle } from "./WithDropCapArticle";
import { WithStickyRelatedArticle } from "./WithStickyRelatedArticle";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function BlogPostPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.blogPost;

  const examples: UIExample[] = [
    {
      id: "blogpost-1",
      title: t.blogPost1TabTitle,
      description: t.blogPost1TabDescription,
      render: () => <WithCenteredAlertArticle />,
    },
    {
      id: "blogpost-2",
      title: t.blogPost2TabTitle,
      description: t.blogPost2TabDescription,
      render: () => <WithStickySidebarArticle />,
    },
    {
      id: "blogpost-3",
      title: t.blogPost3TabTitle,
      description: t.blogPost3TabDescription,
      render: () => <WithStickyNavPromoArticle />,
    },
    {
      id: "blogpost-4",
      title: t.blogPost4TabTitle,
      description: t.blogPost4TabDescription,
      render: () => <WithBreadcrumbShareArticle />,
    },
    {
      id: "blogpost-5",
      title: t.blogPost5TabTitle,
      description: t.blogPost5TabDescription,
      render: () => <WithOffsetRailArticle />,
    },
    {
      id: "blogpost-6",
      title: t.blogPost6TabTitle,
      description: t.blogPost6TabDescription,
      render: () => <WithChapterListArticle />,
    },
    {
      id: "blogpost-7",
      title: t.blogPost7TabTitle,
      description: t.blogPost7TabDescription,
      render: () => <WithAnimatedHeaderArticle />,
    },
    {
      id: "blogpost-8",
      title: t.blogPost8TabTitle,
      description: t.blogPost8TabDescription,
      render: () => <WithSidebarTocArticle />,
    },
    {
      id: "blogpost-9",
      title: t.blogPost9TabTitle,
      description: t.blogPost9TabDescription,
      render: () => <WithAuthorBioArticle />,
    },
    {
      id: "blogpost-10",
      title: t.blogPost10TabTitle,
      description: t.blogPost10TabDescription,
      render: () => <WithProgressBarArticle />,
    },
    {
      id: "blogpost-11",
      title: t.blogPost11TabTitle,
      description: t.blogPost11TabDescription,
      render: () => <WithSplitHeroQuoteArticle />,
    },
    {
      id: "blogpost-12",
      title: t.blogPost12TabTitle,
      description: t.blogPost12TabDescription,
      render: () => <WithDropCapArticle />,
    },
    {
      id: "blogpost-13",
      title: t.blogPost13TabTitle,
      description: t.blogPost13TabDescription,
      render: () => <WithStickyRelatedArticle />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.blogPostTitle}
      intro={m.examples.blogPostDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="blog-post"
    />
  );
}
