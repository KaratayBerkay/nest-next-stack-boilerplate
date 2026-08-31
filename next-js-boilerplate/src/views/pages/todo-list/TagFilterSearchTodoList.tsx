"use client";

import { useMemo, useState } from "react";
import { IconSearch, IconTrash } from "@tabler/icons-react";
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
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTodoListMessages } from "@/types/pages/todo-list/TodoListMessages-types";

type Tag = "work" | "personal" | "urgent";

interface Task {
  id: string;
  text: string;
  done: boolean;
  tag: Tag;
}

const SEED = [
  { id: "seed-1", textKey: "todoList9Task1", done: false, tag: "work" },
  { id: "seed-2", textKey: "todoList9Task2", done: false, tag: "urgent" },
  { id: "seed-3", textKey: "todoList9Task3", done: true, tag: "personal" },
  { id: "seed-4", textKey: "todoList9Task4", done: false, tag: "work" },
  { id: "seed-5", textKey: "todoList9Task5", done: false, tag: "personal" },
  { id: "seed-6", textKey: "todoList9Task6", done: true, tag: "urgent" },
] as const;

const TAGS: Tag[] = ["work", "personal", "urgent"];

export function TagFilterSearchTodoList() {
  const t = useMessages("pages") as unknown as PagesWithTodoListMessages;
  const d = t.todoList;
  const TAG_LABEL: Record<Tag, string> = {
    work: d.todoList9TagWork,
    personal: d.todoList9TagPersonal,
    urgent: d.todoList9TagUrgent,
  };
  const [tasks, setTasks] = useState<Task[]>(() =>
    SEED.map((seed) => ({
      id: seed.id,
      text: d[seed.textKey],
      done: seed.done,
      tag: seed.tag,
    })),
  );
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<Tag | "all">("all");

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesTag = activeTag === "all" || task.tag === activeTag;
      const matchesQuery = !q || task.text.toLowerCase().includes(q);
      return matchesTag && matchesQuery;
    });
  }, [tasks, query, activeTag]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-xl px-6 lg:px-8">
        <Card variant="default">
          <CardHeader>
            <CardTitle>{d.todoList9Heading}</CardTitle>
            <CardDescription>{d.todoList9Subheading}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={d.todoList9SearchPlaceholder}
              aria-label={d.todoList9SearchAria}
              leftIcon={<IconSearch size={16} />}
            />

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTag("all")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  activeTag === "all"
                    ? "bg-brand text-brand-fg"
                    : "bg-surface text-muted hover:text-fg border-border border",
                )}
              >
                {d.todoList9TagAll}
              </button>
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    activeTag === tag
                      ? "bg-brand text-brand-fg"
                      : "bg-surface text-muted hover:text-fg border-border border",
                  )}
                >
                  {TAG_LABEL[tag]}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="text-muted py-6 text-center text-sm">
                {d.todoList9EmptyResults}
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {filtered.map((task) => (
                  <li
                    key={task.id}
                    className={cn(
                      "hover:bg-surface-hover flex items-center justify-between gap-2 rounded-md px-2 py-2",
                      task.done && "opacity-60",
                    )}
                  >
                    <Checkbox
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      label={task.text}
                    />
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="soft" size="sm">
                        {TAG_LABEL[task.tag]}
                      </Badge>
                      <IconButton
                        icon={<IconTrash size={15} aria-hidden="true" />}
                        label={d.todoList9DeleteAria.replace(
                          "{task}",
                          task.text,
                        )}
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => deleteTask(task.id)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
