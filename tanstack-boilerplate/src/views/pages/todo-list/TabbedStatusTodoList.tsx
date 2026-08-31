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
import { IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTodoListMessages } from "@/types/pages/todo-list/TodoListMessages-types";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

const SEED = [
  { id: "seed-1", textKey: "todoList3Task1", done: false },
  { id: "seed-2", textKey: "todoList3Task2", done: false },
  { id: "seed-3", textKey: "todoList3Task3", done: true },
  { id: "seed-4", textKey: "todoList3Task4", done: true },
  { id: "seed-5", textKey: "todoList3Task5", done: false },
  { id: "seed-6", textKey: "todoList3Task6", done: true },
] as const;

function TaskRow({
  task,
  onToggle,
  onDelete,
  deleteLabel,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  deleteLabel: string;
}) {
  return (
    <li className="hover:bg-surface-hover flex items-center justify-between gap-2 rounded-md px-2 py-2">
      <Checkbox checked={task.done} onChange={onToggle} label={task.text} />
      <IconButton
        icon={<IconTrash size={15} aria-hidden="true" />}
        label={deleteLabel}
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
      />
    </li>
  );
}

export function TabbedStatusTodoList() {
  const t = useMessages("pages") as unknown as PagesWithTodoListMessages;
  const d = t.todoList;
  const [tasks, setTasks] = useState<Task[]>(() =>
    SEED.map((seed) => ({ id: seed.id, text: d[seed.textKey], done: seed.done })),
  );
  const [draft, setDraft] = useState("");
  const nextId = useRef(SEED.length + 1);

  const active = tasks.filter((task) => !task.done);
  const completed = tasks.filter((task) => task.done);

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
    setTasks((prev) => [...prev, { id, text: value, done: false }]);
    setDraft("");
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-xl px-6 lg:px-8">
        <Card variant="default">
          <CardHeader>
            <CardTitle>{d.todoList3Heading}</CardTitle>
            <CardDescription>{d.todoList3Subheading}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form onSubmit={addTask} className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={d.todoList3InputPlaceholder}
                aria-label={d.todoList3InputPlaceholder}
              />
              <IconButton
                type="submit"
                icon={<IconPlus size={16} aria-hidden="true" />}
                label={d.todoList3AddAria}
                variant="primary"
                size="icon"
              />
            </form>

            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all" className="gap-1.5">
                  {d.todoList3TabAll}
                  <Badge variant="secondary" size="sm">
                    {tasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="active" className="gap-1.5">
                  {d.todoList3TabActive}
                  <Badge variant="secondary" size="sm">
                    {active.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-1.5">
                  {d.todoList3TabCompleted}
                  <Badge variant="secondary" size="sm">
                    {completed.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-3">
                <ul className="flex flex-col gap-1">
                  {tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTask(task.id)}
                      onDelete={() => deleteTask(task.id)}
                      deleteLabel={d.todoList3DeleteAria.replace("{task}", task.text)}
                    />
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="active" className="mt-3">
                {active.length === 0 ? (
                  <p className="text-muted py-6 text-center text-sm">
                    {d.todoList3EmptyActive}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {active.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggle={() => toggleTask(task.id)}
                        onDelete={() => deleteTask(task.id)}
                        deleteLabel={d.todoList3DeleteAria.replace("{task}", task.text)}
                      />
                    ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="completed" className="mt-3">
                {completed.length === 0 ? (
                  <p className="text-muted py-6 text-center text-sm">
                    {d.todoList3EmptyCompleted}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {completed.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggle={() => toggleTask(task.id)}
                        onDelete={() => deleteTask(task.id)}
                        deleteLabel={d.todoList3DeleteAria.replace("{task}", task.text)}
                      />
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
