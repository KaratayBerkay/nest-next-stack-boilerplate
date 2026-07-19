"use client";

import { useParams } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { TabNav } from "@/views/ui/_shared/TabNav";

export default function AccordionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";
  const t = useMessages("accordion");

  const basePath = `/v1/${lang}/ui/accordion`;

  const items = [
    { id: "", title: t.singleState },
    { id: "variants", title: t.multiState },
    { id: "rich-items", title: t.richItems },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <p className="text-muted text-sm">{t.intro}</p>
      </div>
      <TabNav items={items} basePath={basePath} />
      {children}
    </div>
  );
}
