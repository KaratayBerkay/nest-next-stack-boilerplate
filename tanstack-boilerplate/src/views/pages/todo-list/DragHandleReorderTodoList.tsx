"use client";

import { useState } from "react";
import {
  IconChevronDown,
  IconChevronUp,
  IconGripVertical,
  IconTrash,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTodoListMessages } from "@/types/pages/todo-list/TodoListMessages-types";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

const SEED = [
  { id: "seed-1", textKey: "todoList2Task1", done: false },
  { id: "seed-2", textKey: "todoList2Task2", done: false },
  { id: "seed-3", textKey: "todoList2Task3", done: true },
  { id: "seed-4", textKey: "todoList2Task4", done: false },
  { id: "seed-5", textKey: "todoList2Task5", done: false },
] as const;

export function DragHandleReorderTodoList() {
  const t = useMessages("pages") as unknown as PagesWithTodoListMessages;
  const d = t.todoList;
  const [tasks, setTasks] = useState<Task[]>(() =>
    SEED.map((seed) => ({ id: seed.id, text: d[seed.textKey], done: seed.done })),
  );

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function moveTask(index: number, direction: -1 | 1) {
    setTasks((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-xl px-6 lg:px-8">
        <Card variant="default">
          <CardHeader>
            <CardTitle>{d.todoList2Heading}</CardTitle>
            <CardDescription>{d.todoList2Subheading}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1">
              {tasks.map((task, index) => (
                <li
                  key={task.id}
                  className={cn(
                    "border-border bg-surface flex items-center gap-2 rounded-md border px-2 py-2",
                    task.done && "opacity-60",
                  )}
                >
                  <IconGripVertical
                    size={16}
                    aria-hidden="true"
                    className="text-muted shrink-0 cursor-grab"
                  />
                  <div className="min-w-0 flex-1">
                    <Checkbox
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      label={task.text}
                    />
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <IconButton
                      icon={<IconChevronUp size={15} aria-hidden="true" />}
                      label={d.todoList2MoveUpAria.replace("{task}", task.text)}
                      variant="ghost"
                      size="icon-xs"
                      disabled={index === 0}
                      onClick={() => moveTask(index, -1)}
                    />
                    <IconButton
                      icon={<IconChevronDown size={15} aria-hidden="true" />}
                      label={d.todoList2MoveDownAria.replace("{task}", task.text)}
                      variant="ghost"
                      size="icon-xs"
                      disabled={index === tasks.length - 1}
                      onClick={() => moveTask(index, 1)}
                    />
                    <IconButton
                      icon={<IconTrash size={15} aria-hidden="true" />}
                      label={d.todoList2DeleteAria.replace("{task}", task.text)}
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => deleteTask(task.id)}
                    />
                  </div>
                </li>
              ))}
            </ul>
            {tasks.length === 0 && (
              <p className="text-muted py-6 text-center text-sm">{d.todoList2Empty}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
