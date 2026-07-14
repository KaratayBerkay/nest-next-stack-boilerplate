"use client";

import { useState, type Dispatch, type SetStateAction, type ChangeEvent } from "react";
import {
  Checkbox,
  CheckboxGroup,
  IndeterminateCheckbox,
  CheckboxCard,
  CheckboxChip,
} from "@/components/ui/Checkbox";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { CheckboxVariant, CheckboxSize } from "@/types/ui/Checkbox-types";
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

function TermsConsentTab() {
  const [groupValues, setGroupValues] = useState<string[]>(["react"]);
  const [child1Checked, setChild1Checked] = useState(false);
  const [child2Checked, setChild2Checked] = useState(false);

  const allChildren = child1Checked && child2Checked;
  const someChildren = child1Checked || child2Checked;

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-fg">Default</h3>
        <div className="flex flex-wrap gap-4">
          <Checkbox data-testid="checkbox-default" />
          <Checkbox defaultChecked data-testid="checkbox-checked" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-fg">Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Checkbox size="sm" label="Small" />
          <Checkbox size="md" label="Medium" defaultChecked />
          <Checkbox size="lg" label="Large" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-fg">With Label</h3>
        <Checkbox label="Accept terms and conditions" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-fg">Disabled</h3>
        <div className="flex flex-wrap gap-4">
          <Checkbox disabled />
          <Checkbox disabled defaultChecked />
          <Checkbox disabled label="Disabled option" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-fg">Checkbox Group</h3>
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
        <h3 className="text-sm font-semibold text-fg">Indeterminate</h3>
        <div className="flex flex-col gap-2">
          <IndeterminateCheckbox
            checked={allChildren}
            indeterminate={someChildren && !allChildren}
            label="Parent Item"
            onChange={(e) =>
              handleParentChange(e, setChild1Checked, setChild2Checked)
            }
          />
          <div className="ml-6 flex flex-col gap-2">
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

function SelectAllTab() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", label: "Buy groceries", done: false },
    { id: "2", label: "Walk the dog", done: true },
    { id: "3", label: "Read a book", done: false },
  ]);

  const allDone = todos.every((t) => t.done);
  const someDone = todos.some((t) => t.done);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-fg">To-do List</h3>
        <div className="surface divide-border max-w-sm divide-y overflow-hidden">
          <div className="px-4 py-2">
            <IndeterminateCheckbox
              checked={allDone}
              indeterminate={someDone && !allDone}
              label="Select all"
              onChange={(e) => {
                const checked = e.target.checked;
                setTodos((prev) => prev.map((t) => ({ ...t, done: checked })));
              }}
            />
          </div>
          {todos.map((todo) => (
            <label
              key={todo.id}
              className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm"
            >
              <Checkbox
                checked={todo.done}
                onChange={() => toggleTodo(todo.id, setTodos)}
              />
              <span className={todo.done ? "text-muted line-through" : "text-fg"}>
                {todo.label}
              </span>
            </label>
          ))}
          <div className="text-muted px-4 py-2 text-xs">
            {todos.filter((t) => t.done).length} of {todos.length} completed
          </div>
        </div>
      </section>
    </div>
  );
}

function PlanCardsTab() {
  const [selected, setSelected] = useState<string>("standard");

  const plans = [
    { value: "basic", title: "Basic", description: "For individuals", icon: "★" },
    { value: "standard", title: "Standard", description: "For teams", icon: "★★" },
    { value: "premium", title: "Premium", description: "For enterprises", icon: "★★★" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">Select a plan (radio-like single select via CheckboxCard).</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {plans.map((plan) => (
          <CheckboxCard
            key={plan.value}
            icon={<span className="text-lg">{plan.icon}</span>}
            title={plan.title}
            description={plan.description}
            checked={selected === plan.value}
            onChange={(checked) => {
              if (checked) setSelected(plan.value);
            }}
          />
        ))}
      </div>
      <p className="text-sm text-fg">Selected: {selected}</p>
    </div>
  );
}

function InterestChipsTab() {
  const [interests, setInterests] = useState<string[]>(["design", "coding"]);

  const allChips = [
    { value: "design", label: "Design", count: 12 },
    { value: "coding", label: "Coding", count: 24 },
    { value: "marketing", label: "Marketing", count: 8 },
    { value: "photography", label: "Photography", count: 5 },
  ];

  function toggleChip(value: string) {
    setInterests((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">Filter chips — toggle interests.</p>
      <div className="flex flex-wrap gap-2">
        {allChips.map((chip) => (
          <CheckboxChip
            key={chip.value}
            label={chip.label}
            count={chip.count}
            checked={interests.includes(chip.value)}
            onChange={() => toggleChip(chip.value)}
            onRemove={interests.includes(chip.value) ? () => toggleChip(chip.value) : undefined}
          />
        ))}
      </div>
      <p className="text-sm text-fg">
        Selected: {interests.join(", ") || "none"}
      </p>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "terms-consent",
    title: "Terms Consent",
    description: "Single checkbox with indeterminate state and group.",
    render: () => <TermsConsentTab />,
  },
  {
    id: "select-all",
    title: "Select All",
    description: "Real indeterminate checkbox driving a todo list.",
    render: () => <SelectAllTab />,
  },
  {
    id: "plan-cards",
    title: "Plan Cards",
    description: "CheckboxCard grid acting as a radio-like selector.",
    render: () => <PlanCardsTab />,
  },
  {
    id: "interest-chips",
    title: "Interest Chips",
    description: "CheckboxChip set for filter-style toggles.",
    render: () => <InterestChipsTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default", "shiny", "glass", "neon", "gradient"]}
        sizes={["sm", "md", "lg"]}
        render={(variant, size) => (
          <Checkbox variant={variant as CheckboxVariant} size={size as CheckboxSize} />
        )}
      />
    ),
  },
];

export default function CheckboxPage() {
  return (
    <ExampleTabs
      title="Checkbox"
      intro="A control that allows the user to toggle between checked and unchecked states."
      examples={examples}
    />
  );
}
