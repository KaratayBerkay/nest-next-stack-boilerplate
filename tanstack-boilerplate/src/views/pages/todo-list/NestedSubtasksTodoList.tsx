"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Checkbox, IndeterminateCheckbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTodoListMessages } from "@/types/pages/todo-list/TodoListMessages-types";

interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

interface ParentTask {
  id: string;
  text: string;
  subtasks: Subtask[];
}

const SEED = [
  {
    id: "seed-1",
    textKey: "todoList8Task1",
    subtasks: [
      { id: "seed-1-1", textKey: "todoList8Task1Sub1", done: true },
      { id: "seed-1-2", textKey: "todoList8Task1Sub2", done: true },
      { id: "seed-1-3", textKey: "todoList8Task1Sub3", done: false },
    ],
  },
  {
    id: "seed-2",
    textKey: "todoList8Task2",
    subtasks: [
      { id: "seed-2-1", textKey: "todoList8Task2Sub1", done: true },
      { id: "seed-2-2", textKey: "todoList8Task2Sub2", done: true },
    ],
  },
  {
    id: "seed-3",
    textKey: "todoList8Task3",
    subtasks: [
      { id: "seed-3-1", textKey: "todoList8Task3Sub1", done: false },
      { id: "seed-3-2", textKey: "todoList8Task3Sub2", done: false },
      { id: "seed-3-3", textKey: "todoList8Task3Sub3", done: false },
    ],
  },
  {
    id: "seed-4",
    textKey: "todoList8Task4",
    subtasks: [
      { id: "seed-4-1", textKey: "todoList8Task4Sub1", done: true },
      { id: "seed-4-2", textKey: "todoList8Task4Sub2", done: false },
    ],
  },
] as const;

export function NestedSubtasksTodoList() {
  const t = useMessages("pages") as unknown as PagesWithTodoListMessages;
  const d = t.todoList;
  const [tasks, setTasks] = useState<ParentTask[]>(() =>
    SEED.map((seed) => ({
      id: seed.id,
      text: d[seed.textKey],
      subtasks: seed.subtasks.map((sub) => ({
        id: sub.id,
        text: d[sub.textKey],
        done: sub.done,
      })),
    })),
  );

  function toggleSubtask(taskId: string, subId: string) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id !== taskId
          ? task
          : {
              ...task,
              subtasks: task.subtasks.map((sub) =>
                sub.id === subId ? { ...sub, done: !sub.done } : sub,
              ),
            },
      ),
    );
  }

  function toggleAllSubtasks(taskId: string) {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const allDone = task.subtasks.every((sub) => sub.done);
        return {
          ...task,
          subtasks: task.subtasks.map((sub) => ({ ...sub, done: !allDone })),
        };
      }),
    );
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-xl px-6 lg:px-8">
        <Card variant="default">
          <CardHeader>
            <CardTitle>{d.todoList8Heading}</CardTitle>
            <CardDescription>{d.todoList8Subheading}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {tasks.map((task) => {
                const doneCount = task.subtasks.filter((sub) => sub.done).length;
                const allDone = doneCount === task.subtasks.length;
                const someDone = doneCount > 0;
                return (
                  <AccordionItem key={task.id} value={task.id}>
                    <div className="flex items-center gap-1 pr-3">
                      <span className="pl-4">
                        <IndeterminateCheckbox
                          checked={allDone}
                          indeterminate={someDone && !allDone}
                          onChange={() => toggleAllSubtasks(task.id)}
                          aria-label={d.todoList8ToggleAllAria.replace("{task}", task.text)}
                        />
                      </span>
                      <AccordionTrigger className="group gap-3">
                        <span
                          className={cn(
                            "flex-1 text-left text-sm font-medium",
                            allDone && "text-muted line-through",
                          )}
                        >
                          {task.text}
                        </span>
                        <span className="flex items-center gap-2">
                          <Badge variant="secondary" size="sm">
                            {doneCount}/{task.subtasks.length}
                          </Badge>
                          <IconChevronDown
                            size={16}
                            className="text-muted shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                            aria-hidden="true"
                          />
                        </span>
                      </AccordionTrigger>
                    </div>
                    <AccordionContent>
                      <ul className="flex flex-col gap-1.5 pl-9">
                        {task.subtasks.map((sub) => (
                          <li key={sub.id}>
                            <Checkbox
                              size="sm"
                              checked={sub.done}
                              onChange={() => toggleSubtask(task.id, sub.id)}
                              label={sub.text}
                            />
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
