"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbPage as ShadBreadcrumbPage,
} from "@/components/ui/Breadcrumb";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "components",
    title: "Deep Path",
    description: "Breadcrumb with collapsed middle items in an ellipsis menu.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <ShadBreadcrumbPage>Components</ShadBreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </section>
      </div>
    ),
  },
  {
    id: "examples",
    title: "Simple Trail",
    description: "Three-level breadcrumb with aria-current on the last item.",
    render: () => (
      <div className="flex flex-col gap-4"></div>
    ),
  },
];

export default function BreadcrumbPage() {
  return (
    <ExampleTabs
      title="Breadcrumb"
      intro="Navigation hierarchy indicator."
      examples={examples}
    />
  );
}
