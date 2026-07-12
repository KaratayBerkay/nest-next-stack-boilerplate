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
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Checkbox</h2>
        <p className="text-muted text-sm">
          A control that allows the user to toggle between checked and unchecked
          states.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          <div className="flex flex-col gap-4">
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
              <h3 className="text-lg font-semibold">
                Indeterminate Checkbox (Tree)
              </h3>
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
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <section className="flex flex-col gap-3">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
