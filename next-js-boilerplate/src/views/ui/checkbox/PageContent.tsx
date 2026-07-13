"use client";

import {
  useState,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
} from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Checkbox,
  CheckboxGroup,
  IndeterminateCheckbox,
} from "@/components/ui/Checkbox";

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

export default function CheckboxPage() {
  const [groupValues, setGroupValues] = useState<string[]>(["react"]);
  const [child1Checked, setChild1Checked] = useState(false);
  const [child2Checked, setChild2Checked] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", label: "Buy groceries", done: false },
    { id: "2", label: "Walk the dog", done: true },
    { id: "3", label: "Read a book", done: false },
  ]);

  const allChildren = child1Checked && child2Checked;
  const someChildren = child1Checked || child2Checked;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Checkbox</h2>
        <p className="text-muted text-sm">
          A control that allows the user to toggle between checked and unchecked states with multiple stylish variants.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-6">
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

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Shiny Variant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox variant="shiny" label="Shiny unchecked" />
              <Checkbox variant="shiny" defaultChecked label="Shiny checked" />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Glass Variant</h3>
            <div className="bg-slate-950 p-6 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Checkbox variant="glass" label="Glass unchecked" />
                <Checkbox variant="glass" defaultChecked label="Glass checked" />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Neon Variant</h3>
            <div className="bg-slate-950 p-6 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Checkbox variant="neon" label="Neon unchecked" />
                <Checkbox variant="neon" defaultChecked label="Neon checked" />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Gradient Variant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox variant="gradient" label="Gradient unchecked" />
              <Checkbox variant="gradient" defaultChecked label="Gradient checked" />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
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
            <h3 className="text-lg font-semibold">Registration Form (Gradient)</h3>
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl space-y-4 max-w-sm">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Terms & Preferences</h4>
              <div className="flex flex-col gap-3">
                <Checkbox variant="gradient" label="I agree to the Terms of Service" />
                <Checkbox variant="gradient" defaultChecked label="Subscribe to newsletter" />
                <Checkbox variant="gradient" label="Enable two-factor authentication" />
              </div>
              <button className="w-full rounded bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                Create Account
              </button>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Preferences Panel (Neon)</h3>
            <div className="bg-slate-950 border border-cyan-500/20 max-w-sm overflow-hidden rounded-xl">
              <div className="px-4 py-2 border-b border-cyan-500/20">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Features</span>
              </div>
              <div className="divide-y divide-cyan-500/10 px-4 py-3">
                <div className="flex flex-col gap-3 py-2">
                  <Checkbox variant="neon" defaultChecked label="Real-time sync" />
                  <Checkbox variant="neon" label="Auto-updates" />
                  <Checkbox variant="neon" defaultChecked label="Beta features" />
                </div>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
