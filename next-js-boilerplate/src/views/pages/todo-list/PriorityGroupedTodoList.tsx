"use client";

import { useState } from "react";
import { IconTrash } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTodoListMessages } from "@/types/pages/todo-list/TodoListMessages-types";

type Priority = "high" | "medium" | "low";
type Filter = "all" | Priority;

interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
}

const SEED = [
  { id: "seed-1", textKey: "todoList6Task1", done: false, priority: "high" },
  { id: "seed-2", textKey: "todoList6Task2", done: false, priority: "high" },
  { id: "seed-3", textKey: "todoList6Task3", done: true, priority: "medium" },
  { id: "seed-4", textKey: "todoList6Task4", done: false, priority: "medium" },
  { id: "seed-5", textKey: "todoList6Task5", done: false, priority: "low" },
  { id: "seed-6", textKey: "todoList6Task6", done: true, priority: "low" },
] as const;

const PRIORITY_ORDER: Priority[] = ["high", "medium", "low"];

const PRIORITY_DOT: Record<Priority, string> = {
  high: "bg-error",
  medium: "bg-warning",
  low: "bg-info",
};

const PRIORITY_BADGE: Record<Priority, "error" | "warning" | "info"> = {
  high: "error",
  medium: "warning",
  low: "info",
};

export function PriorityGroupedTodoList() {
  const t = useMessages("pages") as unknown as PagesWithTodoListMessages;
  const d = t.todoList;
  const PRIORITY_LABEL: Record<Priority, string> = {
    high: d.todoList6FilterHigh,
    medium: d.todoList6FilterMedium,
    low: d.todoList6FilterLow,
  };
  const SECTION_LABEL: Record<Priority, string> = {
    high: d.todoList6SectionHigh,
    medium: d.todoList6SectionMedium,
    low: d.todoList6SectionLow,
  };
  const [tasks, setTasks] = useState<Task[]>(() =>
    SEED.map((seed) => ({
      id: seed.id,
      text: d[seed.textKey],
      done: seed.done,
      priority: seed.priority,
    })),
  );
  const [filter, setFilter] = useState<Filter>("all");

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

  const visibleGroups =
    filter === "all"
      ? PRIORITY_ORDER
      : PRIORITY_ORDER.filter((p) => p === filter);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <Card variant="default">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle>{d.todoList6Heading}</CardTitle>
                <CardDescription>{d.todoList6Subheading}</CardDescription>
              </div>
              <ToggleGroup
                type="single"
                value={filter}
                onValueChange={(value) => {
                  if (value) setFilter(value as Filter);
                }}
                aria-label={d.todoList6FilterGroupAria}
              >
                <ToggleGroupItem value="all" size="sm">
                  {d.todoList6FilterAll}
                </ToggleGroupItem>
                {PRIORITY_ORDER.map((priority) => (
                  <ToggleGroupItem
                    key={priority}
                    value={priority}
                    size="sm"
                    className="gap-1.5"
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        PRIORITY_DOT[priority],
                      )}
                      aria-hidden="true"
                    />
                    {PRIORITY_LABEL[priority]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {visibleGroups.map((priority) => {
              const groupTasks = tasks.filter(
                (task) => task.priority === priority,
              );
              return (
                <div key={priority} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant={PRIORITY_BADGE[priority]} size="sm">
                      {SECTION_LABEL[priority]}
                    </Badge>
                    <span className="text-muted text-xs tabular-nums">
                      {groupTasks.length}
                    </span>
                  </div>
                  {groupTasks.length === 0 ? (
                    <p className="text-muted px-2 py-1.5 text-sm">
                      {d.todoList6EmptyGroup}
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-0.5">
                      {groupTasks.map((task) => (
                        <li
                          key={task.id}
                          className={cn(
                            "hover:bg-surface-hover flex items-center justify-between gap-2 rounded-md px-2 py-1.5",
                            task.done && "opacity-60",
                          )}
                        >
                          <Checkbox
                            checked={task.done}
                            onChange={() => toggleTask(task.id)}
                            label={task.text}
                            size="sm"
                          />
                          <IconButton
                            icon={<IconTrash size={14} aria-hidden="true" />}
                            label={d.todoList6DeleteAria.replace(
                              "{task}",
                              task.text,
                            )}
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => deleteTask(task.id)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
