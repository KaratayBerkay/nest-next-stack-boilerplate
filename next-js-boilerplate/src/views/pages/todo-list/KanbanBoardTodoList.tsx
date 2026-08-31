"use client";

import { useState } from "react";
import { IconArrowLeft, IconArrowRight, IconTrash } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTodoListMessages } from "@/types/pages/todo-list/TodoListMessages-types";

type Status = "todo" | "doing" | "done";

interface Task {
  id: string;
  text: string;
  status: Status;
}

const SEED = [
  { id: "seed-1", textKey: "todoList10Task1", status: "todo" },
  { id: "seed-2", textKey: "todoList10Task2", status: "todo" },
  { id: "seed-3", textKey: "todoList10Task3", status: "doing" },
  { id: "seed-4", textKey: "todoList10Task4", status: "doing" },
  { id: "seed-5", textKey: "todoList10Task5", status: "done" },
  { id: "seed-6", textKey: "todoList10Task6", status: "done" },
] as const;

const STATUSES: Status[] = ["todo", "doing", "done"];

export function KanbanBoardTodoList() {
  const t = useMessages("pages") as unknown as PagesWithTodoListMessages;
  const d = t.todoList;
  const COLUMN_LABEL: Record<Status, string> = {
    todo: d.todoList10ColumnTodo,
    doing: d.todoList10ColumnDoing,
    done: d.todoList10ColumnDone,
  };
  const [tasks, setTasks] = useState<Task[]>(() =>
    SEED.map((seed) => ({
      id: seed.id,
      text: d[seed.textKey],
      status: seed.status,
    })),
  );

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function moveTask(id: string, direction: -1 | 1) {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const currentIndex = STATUSES.indexOf(task.status);
        const nextIndex = currentIndex + direction;
        if (nextIndex < 0 || nextIndex >= STATUSES.length) return task;
        return { ...task, status: STATUSES[nextIndex] };
      }),
    );
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <Card variant="default">
          <CardHeader>
            <CardTitle>{d.todoList10Heading}</CardTitle>
            <CardDescription>{d.todoList10Subheading}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {STATUSES.map((status, columnIndex) => {
                const columnTasks = tasks.filter(
                  (task) => task.status === status,
                );
                return (
                  <div
                    key={status}
                    className="bg-surface flex flex-col gap-2 rounded-lg p-2.5"
                  >
                    <div className="flex items-center justify-between px-1 pt-0.5 pb-1">
                      <span className="text-fg text-xs font-semibold tracking-wide uppercase">
                        {COLUMN_LABEL[status]}
                      </span>
                      <Badge variant="secondary" size="sm">
                        {columnTasks.length}
                      </Badge>
                    </div>
                    {columnTasks.length === 0 ? (
                      <p className="text-muted px-1 py-3 text-center text-xs">
                        {d.todoList10EmptyColumn}
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {columnTasks.map((task) => (
                          <li
                            key={task.id}
                            className={cn(
                              "border-border bg-bg flex flex-col gap-2 rounded-md border p-2.5 shadow-xs",
                              status === "done" && "opacity-70",
                            )}
                          >
                            <span
                              className={cn(
                                "text-fg text-sm",
                                status === "done" && "line-through",
                              )}
                            >
                              {task.text}
                            </span>
                            <div className="flex items-center justify-between">
                              <IconButton
                                icon={
                                  <IconArrowLeft size={14} aria-hidden="true" />
                                }
                                label={d.todoList10MoveBackAria.replace(
                                  "{task}",
                                  task.text,
                                )}
                                variant="ghost"
                                size="icon-xs"
                                disabled={columnIndex === 0}
                                onClick={() => moveTask(task.id, -1)}
                              />
                              <IconButton
                                icon={
                                  <IconTrash size={13} aria-hidden="true" />
                                }
                                label={d.todoList10DeleteAria.replace(
                                  "{task}",
                                  task.text,
                                )}
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => deleteTask(task.id)}
                              />
                              <IconButton
                                icon={
                                  <IconArrowRight
                                    size={14}
                                    aria-hidden="true"
                                  />
                                }
                                label={d.todoList10MoveForwardAria.replace(
                                  "{task}",
                                  task.text,
                                )}
                                variant="ghost"
                                size="icon-xs"
                                disabled={columnIndex === STATUSES.length - 1}
                                onClick={() => moveTask(task.id, 1)}
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
