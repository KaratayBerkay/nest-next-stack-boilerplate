"use client";

import { useState } from "react";
import { IconCheck, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
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
  { id: "seed-1", textKey: "todoList5Task1", done: false },
  { id: "seed-2", textKey: "todoList5Task2", done: true },
  { id: "seed-3", textKey: "todoList5Task3", done: false },
  { id: "seed-4", textKey: "todoList5Task4", done: false },
  { id: "seed-5", textKey: "todoList5Task5", done: false },
] as const;

export function SwipeActionRowTodoList() {
  const t = useMessages("pages") as unknown as PagesWithTodoListMessages;
  const d = t.todoList;
  const [tasks, setTasks] = useState<Task[]>(() =>
    SEED.map((seed) => ({
      id: seed.id,
      text: d[seed.textKey],
      done: seed.done,
    })),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setDraftText(task.text);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftText("");
  }

  function saveEdit(id: string) {
    const value = draftText.trim();
    if (value) {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, text: value } : task)),
      );
    }
    setEditingId(null);
    setDraftText("");
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-xl px-6 lg:px-8">
        <Card variant="default">
          <CardHeader>
            <CardTitle>{d.todoList5Heading}</CardTitle>
            <CardDescription>{d.todoList5Subheading}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1">
              {tasks.map((task) => {
                const isEditing = editingId === task.id;
                return (
                  <li
                    key={task.id}
                    className={cn(
                      "group flex items-center gap-2 rounded-md border-l-4 py-2 pr-2 pl-2.5 transition-colors",
                      task.done
                        ? "border-success bg-success/5"
                        : "hover:bg-surface-hover border-transparent",
                    )}
                  >
                    <Checkbox
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      aria-label={d.todoList5ToggleAria.replace(
                        "{task}",
                        task.text,
                      )}
                    />
                    {isEditing ? (
                      <div className="flex flex-1 items-center gap-1">
                        <Input
                          value={draftText}
                          onChange={(event) => setDraftText(event.target.value)}
                          aria-label={d.todoList5EditInputAria}
                        />
                        <IconButton
                          icon={<IconCheck size={15} aria-hidden="true" />}
                          label={d.todoList5SaveAria}
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => saveEdit(task.id)}
                        />
                        <IconButton
                          icon={<IconX size={15} aria-hidden="true" />}
                          label={d.todoList5CancelAria}
                          variant="ghost"
                          size="icon-sm"
                          onClick={cancelEdit}
                        />
                      </div>
                    ) : (
                      <>
                        <span
                          className={cn(
                            "flex-1 truncate text-sm",
                            task.done ? "text-muted line-through" : "text-fg",
                          )}
                        >
                          {task.text}
                        </span>
                        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                          <IconButton
                            icon={<IconPencil size={15} aria-hidden="true" />}
                            label={d.todoList5EditAria.replace(
                              "{task}",
                              task.text,
                            )}
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => startEdit(task)}
                          />
                          <IconButton
                            icon={<IconTrash size={15} aria-hidden="true" />}
                            label={d.todoList5DeleteAria.replace(
                              "{task}",
                              task.text,
                            )}
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => deleteTask(task.id)}
                          />
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
            {tasks.length === 0 && (
              <p className="text-muted py-6 text-center text-sm">
                {d.todoList5Empty}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
