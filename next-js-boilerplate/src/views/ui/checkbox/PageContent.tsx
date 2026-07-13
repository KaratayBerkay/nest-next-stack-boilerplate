"use client";

import {
  useState,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
} from "react";
import {
  Checkbox,
  CheckboxGroup,
  IndeterminateCheckbox,
} from "@/components/ui/Checkbox";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

type Todo = { id: string; label: string; done: boolean };

function handleParentChange(
  e: ChangeEvent<HTMLInputElement>,
  setChild1Checked: Dispatch<SetStateAction<boolean>>,
  setChild2Checked: Dispatch<SetStateAction<boolean>>,
) {
  const checked = e.target.checked;
  setChild1Checked(checked);
  setChild2Checked(checked);
}

function toggleTodo(id: string, setTodos: Dispatch<SetStateAction<Todo[]>>) {
  setTodos((prev) =>
    prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  );
}

function ComponentsTab() {
  const [groupValues, setGroupValues] = useState<string[]>(["react"]);
  const [child1Checked, setChild1Checked] = useState(false);
  const [child2Checked, setChild2Checked] = useState(false);

  const allChildren = child1Checked && child2Checked;
  const someChildren = child1Checked || child2Checked;

  return (
    <>
      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Default</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Checkbox data-testid="checkbox-default" />
          <Checkbox defaultChecked data-testid="checkbox-checked" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Disabled</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Checkbox disabled data-testid="checkbox-disabled" />
          <Checkbox disabled defaultChecked data-testid="checkbox-disabled-checked" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">With Label</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Checkbox label="Accept terms and conditions" data-testid="checkbox-with-label" />
          <Checkbox label="Disabled option" disabled data-testid="checkbox-disabled-label" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
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

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Indeterminate Checkbox (Tree)</h3>
        <div className="flex flex-col gap-2">
          <IndeterminateCheckbox
            checked={allChildren}
            indeterminate={someChildren && !allChildren}
            label="Parent Item"
            onChange={(e) =>
              handleParentChange(e, setChild1Checked, setChild2Checked)
            }
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
    </>
  );
}

function ExamplesTab() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", label: "Buy groceries", done: false },
    { id: "2", label: "Walk the dog", done: true },
    { id: "3", label: "Read a book", done: false },
  ]);

  return (
    <>
      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">To-do List</h3>
        <div className="surface divide-border max-w-sm divide-y overflow-hidden">
          {todos.map((todo) => (
            <label
              key={todo.id}
              className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm"
            >
              <Checkbox
                checked={todo.done}
                onChange={() => toggleTodo(todo.id, setTodos)}
              />
              <span className={todo.done ? "text-muted line-through" : ""}>
                {todo.label}
              </span>
            </label>
          ))}
          <div className="text-muted px-4 py-2 text-xs">
            {todos.filter((t) => t.done).length} of {todos.length} completed
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Registration Form</h3>
        <div className="surface max-w-sm p-6 rounded-xl space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider">Terms & Preferences</h4>
          <div className="flex flex-col gap-3">
            <Checkbox label="I agree to the Terms of Service" />
            <Checkbox defaultChecked label="Subscribe to newsletter" />
            <Checkbox label="Enable two-factor authentication" />
          </div>
          <button className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Create Account
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Preferences Panel</h3>
        <div className="surface max-w-sm overflow-hidden rounded-xl border">
          <div className="px-4 py-2 border-b">
            <span className="text-xs font-semibold uppercase tracking-wider">Features</span>
          </div>
          <div className="divide-y px-4 py-3">
            <div className="flex flex-col gap-3 py-2">
              <Checkbox defaultChecked label="Real-time sync" />
              <Checkbox label="Auto-updates" />
              <Checkbox defaultChecked label="Beta features" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const examples: UIExample[] = [
  {
    id: "components",
    title: "Terms Consent",
    description: "Single checkbox for accepting terms and conditions.",
    render: () => <ComponentsTab />,
  },
  {
    id: "examples",
    title: "Preference List",
    description: "Checkbox group with select-all indeterminate state.",
    render: () => <ExamplesTab />,
  },
];

export default function CheckboxPage() {
  return (
    <ExampleTabs
      title="Checkbox"
      intro="A control that allows the user to toggle between checked and unchecked states with multiple stylish variants."
      examples={examples}
    />
  );
}
