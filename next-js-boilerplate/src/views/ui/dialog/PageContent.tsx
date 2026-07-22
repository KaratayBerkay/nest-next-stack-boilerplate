"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { EditProfileTab } from "@/views/ui/dialog/EditProfileTab";
import { SizeScaleTab } from "@/views/ui/dialog/SizeScaleTab";
import { TermsScrollTab } from "@/views/ui/dialog/TermsScrollTab";
import { NestedConfirmTab } from "@/views/ui/dialog/NestedConfirmTab";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "edit-profile",
    title: "Edit Profile",
    description: "Dialog with a form and pinned header/footer actions.",
    render: () => <EditProfileTab />,
  },
  {
    id: "size-scale",
    title: "Size Scale",
    description: "Dialog size variants: sm, md, lg, and full.",
    render: () => <SizeScaleTab />,
  },
  {
    id: "terms-scroll",
    title: "Terms Scroll",
    description:
      "Long form body with pinned header and footer. Body scrolls with scroll-fade treatment.",
    render: () => <TermsScrollTab />,
  },
  {
    id: "nested-confirm",
    title: "Nested Confirm",
    description:
      "Dialog containing a confirm-dialog. Escape closes only the top layer.",
    render: () => <NestedConfirmTab />,
  },
];

export default function Page({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Dialog"
      intro="A modal window that interrupts the user with content. Header and footer are pinned; body scrolls independently."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
