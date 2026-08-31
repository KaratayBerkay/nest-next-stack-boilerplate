"use client";

import { useRef, useState } from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { IconButton, Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTodoListMessages } from "@/types/pages/todo-list/TodoListMessages-types";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

const SEED = [
  { id: "seed-1", textKey: "todoList1Task1", done: false },
  { id: "seed-2", textKey: "todoList1Task2", done: true },
  { id: "seed-3", textKey: "todoList1Task3", done: false },
  { id: "seed-4", textKey: "todoList1Task4", done: false },
  { id: "seed-5", textKey: "todoList1Task5", done: true },
] as const;

export function SimpleChecklistTodoList() {
  const t = useMessages("pages") as unknown as PagesWithTodoListMessages;
  const d = t.todoList;
  const [tasks, setTasks] = useState<Task[]>(() =>
    SEED.map((seed) => ({
      id: seed.id,
      text: d[seed.textKey],
      done: seed.done,
    })),
  );
  const [draft, setDraft] = useState("");
  const nextId = useRef(SEED.length + 1);

  const doneCount = tasks.filter((task) => task.done).length;
  const percent =
    tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function addTask(event: React.FormEvent) {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    const id = `custom-${nextId.current}`;
    nextId.current += 1;
    setTasks((prev) => [...prev, { id, text: value, done: false }]);
    setDraft("");
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-xl px-6 lg:px-8">
        <Card variant="default">
          <CardHeader>
            <CardTitle>{d.todoList1Heading}</CardTitle>
            <CardDescription>{d.todoList1Subheading}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form onSubmit={addTask} className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={d.todoList1InputPlaceholder}
                aria-label={d.todoList1InputPlaceholder}
              />
              <Button
                type="submit"
                variant="primary"
                leftIcon={<IconPlus size={16} />}
              >
                {d.todoList1AddButton}
              </Button>
            </form>

            {tasks.length === 0 ? (
              <p className="text-muted py-6 text-center text-sm">
                {d.todoList1Empty}
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className={cn(
                      "hover:bg-surface-hover flex items-center justify-between gap-2 rounded-md px-2 py-2 transition-opacity",
                      task.done && "opacity-60",
                    )}
                  >
                    <Checkbox
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      label={task.text}
                    />
                    <IconButton
                      icon={<IconTrash size={15} aria-hidden="true" />}
                      label={d.todoList1DeleteAria.replace("{task}", task.text)}
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteTask(task.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <div className="border-border flex items-center gap-3 border-t px-4 py-3 @sm:px-6">
            <Progress value={percent} className="flex-1" size="sm" />
            <span className="text-muted shrink-0 text-xs tabular-nums">
              {d.todoList1CountLabel
                .replace("{done}", String(doneCount))
                .replace("{total}", String(tasks.length))}
            </span>
          </div>
        </Card>
      </div>
    </section>
  );
}
