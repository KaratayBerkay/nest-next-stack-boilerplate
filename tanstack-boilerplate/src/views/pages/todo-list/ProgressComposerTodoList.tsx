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
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTodoListMessages } from "@/types/pages/todo-list/TodoListMessages-types";

type Priority = "low" | "medium" | "high";

interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
}

const SEED = [
  { id: "seed-1", textKey: "todoList4Task1", done: false, priority: "high" },
  { id: "seed-2", textKey: "todoList4Task2", done: false, priority: "medium" },
  { id: "seed-3", textKey: "todoList4Task3", done: true, priority: "low" },
  { id: "seed-4", textKey: "todoList4Task4", done: false, priority: "medium" },
  { id: "seed-5", textKey: "todoList4Task5", done: true, priority: "high" },
] as const;

const PRIORITY_BADGE: Record<Priority, "secondary" | "warning" | "error"> = {
  low: "secondary",
  medium: "warning",
  high: "error",
};

export function ProgressComposerTodoList() {
  const t = useMessages("pages") as unknown as PagesWithTodoListMessages;
  const d = t.todoList;
  const PRIORITY_LABEL: Record<Priority, string> = {
    low: d.todoList4PriorityLow,
    medium: d.todoList4PriorityMedium,
    high: d.todoList4PriorityHigh,
  };
  const [tasks, setTasks] = useState<Task[]>(() =>
    SEED.map((seed) => ({
      id: seed.id,
      text: d[seed.textKey],
      done: seed.done,
      priority: seed.priority,
    })),
  );
  const [draft, setDraft] = useState("");
  const [draftPriority, setDraftPriority] = useState<Priority>("medium");
  const nextId = useRef(SEED.length + 1);

  const doneCount = tasks.filter((task) => task.done).length;
  const percent = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
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
    setTasks((prev) => [...prev, { id, text: value, done: false, priority: draftPriority }]);
    setDraft("");
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-xl px-6 lg:px-8">
        <Card variant="default">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle>{d.todoList4Heading}</CardTitle>
                <CardDescription>{d.todoList4Subheading}</CardDescription>
              </div>
              <span className="text-brand shrink-0 text-2xl font-bold tabular-nums">
                {percent}%
              </span>
            </div>
            <Progress value={percent} size="lg" className="mt-2" />
            <span className="text-muted text-xs">
              {d.todoList4StatsLabel
                .replace("{done}", String(doneCount))
                .replace("{total}", String(tasks.length))}
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form onSubmit={addTask} className="border-border flex flex-col gap-2 rounded-lg border border-dashed p-3">
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={d.todoList4InputPlaceholder}
                aria-label={d.todoList4InputPlaceholder}
              />
              <div className="flex items-center justify-between gap-2">
                <ToggleGroup
                  type="single"
                  value={draftPriority}
                  onValueChange={(value) => {
                    if (value) setDraftPriority(value as Priority);
                  }}
                  aria-label={d.todoList4PriorityGroupAria}
                >
                  <ToggleGroupItem value="low" size="sm">
                    {d.todoList4PriorityLow}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="medium" size="sm">
                    {d.todoList4PriorityMedium}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="high" size="sm">
                    {d.todoList4PriorityHigh}
                  </ToggleGroupItem>
                </ToggleGroup>
                <Button type="submit" variant="primary" size="sm" leftIcon={<IconPlus size={15} />}>
                  {d.todoList4AddButton}
                </Button>
              </div>
            </form>

            <ul className="flex flex-col gap-1">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="hover:bg-surface-hover flex items-center justify-between gap-2 rounded-md px-2 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Checkbox checked={task.done} onChange={() => toggleTask(task.id)} label={task.text} />
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={PRIORITY_BADGE[task.priority]} size="sm">
                      {PRIORITY_LABEL[task.priority]}
                    </Badge>
                    <IconButton
                      icon={<IconTrash size={15} aria-hidden="true" />}
                      label={d.todoList4DeleteAria.replace("{task}", task.text)}
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteTask(task.id)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
