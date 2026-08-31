"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Checkbox, IndeterminateCheckbox } from "@/components/ui/Checkbox";

type Todo = { id: string; label: string; done: boolean };

function toggleTodo(id: string, setTodos: Dispatch<SetStateAction<Todo[]>>) {
  setTodos((prev) =>
    prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  );
}

export function SelectAllTab() {
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
        <h3 className="text-fg text-sm font-semibold">To-do List</h3>
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
              <span
                className={todo.done ? "text-muted line-through" : "text-fg"}
              >
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
