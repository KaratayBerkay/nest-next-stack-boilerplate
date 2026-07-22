"use client";

import {
  useState,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
} from "react";
import { Checkbox, CheckboxGroup, IndeterminateCheckbox } from "@/components/ui/Checkbox";

function handleParentChange(
  e: ChangeEvent<HTMLInputElement>,
  setChild1Checked: Dispatch<SetStateAction<boolean>>,
  setChild2Checked: Dispatch<SetStateAction<boolean>>,
) {
  const checked = e.target.checked;
  setChild1Checked(checked);
  setChild2Checked(checked);
}

export function TermsConsentTab() {
  const [groupValues, setGroupValues] = useState<string[]>(["react"]);
  const [child1Checked, setChild1Checked] = useState(false);
  const [child2Checked, setChild2Checked] = useState(false);

  const allChildren = child1Checked && child2Checked;
  const someChildren = child1Checked || child2Checked;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-fg text-sm font-semibold">Default</h3>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Checkbox label="Unchecked" data-testid="checkbox-default" />
          <Checkbox
            defaultChecked
            label="Checked"
            data-testid="checkbox-checked"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-fg text-sm font-semibold">Sizes</h3>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Checkbox size="sm" label="Small" />
          <Checkbox size="md" label="Medium" defaultChecked />
          <Checkbox size="lg" label="Large" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-fg text-sm font-semibold">With Label</h3>
        <Checkbox label="Accept terms and conditions" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-fg text-sm font-semibold">Disabled</h3>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Checkbox disabled label="Unchecked" />
          <Checkbox disabled defaultChecked label="Checked" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-fg text-sm font-semibold">Checkbox Group</h3>
        <CheckboxGroup
          label="Favorite frameworks"
          values={groupValues}
          onValueChange={setGroupValues}
          showSelectAll
          items={[
            { value: "react", label: "React" },
            { value: "vue", label: "Vue" },
            { value: "svelte", label: "Svelte" },
            { value: "angular", label: "Angular", disabled: true },
          ]}
        />
        <p className="text-muted text-xs">
          Selected: {groupValues.join(", ") || "none"}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-fg text-sm font-semibold">Indeterminate</h3>
        <div className="flex flex-col gap-2">
          <IndeterminateCheckbox
            checked={allChildren}
            indeterminate={someChildren && !allChildren}
            label="Parent Item"
            onChange={(e) =>
              handleParentChange(e, setChild1Checked, setChild2Checked)
            }
          />
          <div className="border-border ml-[9px] flex flex-col gap-2 border-l pl-[15px]">
            <Checkbox
              checked={child1Checked}
              onChange={(e) => setChild1Checked(e.target.checked)}
              label="Child Item 1"
            />
            <Checkbox
              checked={child2Checked}
              onChange={(e) => setChild2Checked(e.target.checked)}
              label="Child Item 2"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
