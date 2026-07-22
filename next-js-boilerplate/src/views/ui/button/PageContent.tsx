"use client";

import {
  Button,
  ButtonGroup,
  ButtonGroupItem,
} from "@/components/ui/Button";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { FormActionsTab } from "@/views/ui/button/FormActionsTab";
import { DestructiveFlowTab } from "@/views/ui/button/DestructiveFlowTab";
import { SignInButtonsTab } from "@/views/ui/button/SignInButtonsTab";
import { IconButtonsTab } from "@/views/ui/button/IconButtonsTab";
import { ButtonGroupsTab } from "@/views/ui/button/ButtonGroupsTab";
import type { Variant, Size } from "@/components/ui/button-styles";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

export default function ButtonPage({ initialTab }: InitialTabProps) {
  const examples: UIExample[] = [
    {
      id: "usage",
      title: "Form Actions",
      description:
        "All button variants, sizes, loading states, and destructive flow.",
      render: () => <FormActionsTab />,
    },
    {
      id: "sign-in",
      title: "Sign-in Buttons",
      description:
        "Social sign-in with Google, GitHub, and email with loading states.",
      render: () => <SignInButtonsTab />,
    },
    {
      id: "destructive-flow",
      title: "Destructive Flow",
      description:
        "Destructive action with confirmation dialog and undoable toast.",
      render: () => <DestructiveFlowTab />,
    },
    {
      id: "icon-buttons",
      title: "Icon Buttons",
      description: "Icon button sizes with tooltips and real action examples.",
      render: () => <IconButtonsTab />,
    },
    {
      id: "button-groups",
      title: "Button Groups",
      description: "Horizontal and vertical button group variants.",
      render: () => <ButtonGroupsTab />,
    },
    {
      id: "variant-gallery",
      title: "Variant Gallery",
      description: "All variants and sizes.",
      render: () => (
        <VariantGallery
          variants={[
            "default",
            "primary",
            "secondary",
            "outline",
            "ghost",
            "destructive",
            "link",
            "soft",
            "shadow",
          ]}
          sizes={["xs", "sm", "md", "lg", "icon", "icon-sm", "icon-xs"]}
          render={(variant, size) =>
            size.startsWith("icon") ? (
              <Button
                variant={variant as Variant}
                size={size as Size}
                aria-label="Add"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </Button>
            ) : (
              <Button variant={variant as Variant} size={size as Size}>
                Button
              </Button>
            )
          }
        />
      ),
    },
  ];

  return (
    <ExampleTabs
      title="Button"
      intro="Displays a button or a component that looks like a button."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
