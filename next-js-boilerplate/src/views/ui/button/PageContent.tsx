"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  Button,
  IconButton,
  ButtonGroup,
  ButtonGroupItem,
} from "@/components/ui/Button";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function handleSave(setSaving: Dispatch<SetStateAction<boolean>>) {
  setSaving(true);
  setTimeout(() => setSaving(false), 1500);
}

function ComponentsTab({
  groupValue,
  setGroupValue,
}: {
  groupValue: string;
  setGroupValue: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Variants</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default" data-testid="button-default">
            Default
          </Button>
          <Button variant="primary" data-testid="button-primary">
            Primary
          </Button>
          <Button variant="secondary" data-testid="button-secondary">
            Secondary
          </Button>
          <Button variant="outline" data-testid="button-outline">
            Outline
          </Button>
          <Button variant="ghost" data-testid="button-ghost">
            Ghost
          </Button>
          <Button variant="destructive" data-testid="button-destructive">
            Destructive
          </Button>
          <Button variant="link" data-testid="button-link">
            Link
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs" data-testid="button-xs">
            Extra Small
          </Button>
          <Button size="sm" data-testid="button-sm">
            Small
          </Button>
          <Button size="md" data-testid="button-md">
            Medium
          </Button>
          <Button size="lg" data-testid="button-lg">
            Large
          </Button>
          <Button
            size="icon"
            data-testid="button-icon"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Button>
          <Button
            size="icon-sm"
            data-testid="button-icon-sm"
            aria-label="Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
          <Button
            size="icon-xs"
            data-testid="button-icon-xs"
            aria-label="X"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Icon Buttons</h3>
        <div className="flex flex-wrap items-center gap-3">
          <IconButton
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            }
            label="Search"
            variant="ghost"
            size="icon"
            data-testid="icon-button-search"
          />
          <IconButton
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" />
                <path d="M9 12h6" />
              </svg>
            }
            label="Minus"
            variant="outline"
            size="icon-sm"
            data-testid="icon-button-minus"
          />
          <IconButton
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            }
            label="Close"
            variant="destructive"
            size="icon-xs"
            data-testid="icon-button-close"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Button Group</h3>
        <ButtonGroup data-testid="button-group">
          <ButtonGroupItem
            active={groupValue === "list"}
            onClick={() => setGroupValue("list")}
            data-testid="button-group-list"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-1"
            >
              <line x1="8" x2="21" y1="6" y2="6" />
              <line x1="8" x2="21" y1="12" y2="12" />
              <line x1="8" x2="21" y1="18" y2="18" />
              <line x1="3" x2="3.01" y1="6" y2="6" />
              <line x1="3" x2="3.01" y1="12" y2="12" />
              <line x1="3" x2="3.01" y1="18" y2="18" />
            </svg>
            List
          </ButtonGroupItem>
          <ButtonGroupItem
            active={groupValue === "grid"}
            onClick={() => setGroupValue("grid")}
            data-testid="button-group-grid"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-1"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Grid
          </ButtonGroupItem>
          <ButtonGroupItem
            active={groupValue === "card"}
            onClick={() => setGroupValue("card")}
            data-testid="button-group-card"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-1"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="2" x2="22" y1="9" y2="9" />
            </svg>
            Card
          </ButtonGroupItem>
        </ButtonGroup>
        <p className="text-muted text-xs">Selected view: {groupValue}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Disabled</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled data-testid="button-disabled-default">
            Default
          </Button>
          <Button
            variant="primary"
            disabled
            data-testid="button-disabled-primary"
          >
            Primary
          </Button>
          <Button
            variant="outline"
            disabled
            data-testid="button-disabled-outline"
          >
            Outline
          </Button>
          <Button
            variant="destructive"
            disabled
            data-testid="button-disabled-destructive"
          >
            Destructive
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function ButtonPage() {
  const [groupValue, setGroupValue] = useState("list");
  const [saving, setSaving] = useState(false);

  const examples: UIExample[] = [
    {
      id: "components",
      title: "Form Actions",
      description: "Submit and cancel button pair with loading state on the primary action.",
      render: () => <ComponentsTab groupValue={groupValue} setGroupValue={setGroupValue} />,
    },
    {
      id: "examples",
      title: "Icon Toolbar",
      description: "Icon buttons in a toolbar row with size and variant variants.",
      render: () => (
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Form Actions</h3>
          <div className="surface max-w-sm space-y-3 p-4">
            <p className="text-muted text-sm">
              Simulate saving changes with a loading state.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={() => handleSave(setSaving)}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="ghost">Cancel</Button>
            </div>
          </div>
        </section>
      ),
    },
  ];

  return (
    <ExampleTabs
      title="Button"
      intro="Displays a button or a component that looks like a button."
      examples={examples}
    />
  );
}
