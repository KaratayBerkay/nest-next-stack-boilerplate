"use client";

import { useState } from "react";
import { Checkbox, CheckboxGroup, IndeterminateCheckbox } from "@/components/ui/Checkbox";

export default function CheckboxPage() {
  const [groupValues, setGroupValues] = useState<string[]>(["react"]);
  const [parentChecked, setParentChecked] = useState(false);
  const [child1Checked, setChild1Checked] = useState(false);
  const [child2Checked, setChild2Checked] = useState(false);

  const allChildren = child1Checked && child2Checked;
  const someChildren = child1Checked || child2Checked;

  const handleParentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setParentChecked(checked);
    setChild1Checked(checked);
    setChild2Checked(checked);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Checkbox</h2>
      <p className="text-muted text-sm">
        A control that allows the user to toggle between checked and unchecked
        states.
      </p>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Checkbox data-testid="checkbox-default" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Checked</h3>
        <Checkbox defaultChecked data-testid="checkbox-checked" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Disabled</h3>
        <div className="flex flex-col gap-2">
          <Checkbox disabled data-testid="checkbox-disabled" />
          <Checkbox
            disabled
            defaultChecked
            data-testid="checkbox-disabled-checked"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">With Label</h3>
        <div className="flex flex-col gap-2">
          <Checkbox
            label="Accept terms and conditions"
            data-testid="checkbox-with-label"
          />
          <Checkbox
            label="Disabled option"
            disabled
            data-testid="checkbox-disabled-label"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Checkbox Group</h3>
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
          data-testid="checkbox-group"
        />
        <p className="text-muted text-xs">
          Selected: {groupValues.join(", ") || "none"}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Indeterminate Checkbox (Tree)</h3>
        <div className="flex flex-col gap-2">
          <IndeterminateCheckbox
            checked={allChildren}
            indeterminate={someChildren && !allChildren}
            label="Parent Item"
            onChange={handleParentChange}
            data-testid="indeterminate-parent"
          />
          <div className="ml-6 flex flex-col gap-2">
            <Checkbox
              checked={child1Checked}
              onChange={(e) => setChild1Checked(e.target.checked)}
              label="Child Item 1"
              data-testid="indeterminate-child1"
            />
            <Checkbox
              checked={child2Checked}
              onChange={(e) => setChild2Checked(e.target.checked)}
              label="Child Item 2"
              data-testid="indeterminate-child2"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
