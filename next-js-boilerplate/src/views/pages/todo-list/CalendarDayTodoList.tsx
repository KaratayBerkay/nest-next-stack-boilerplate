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
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTodoListMessages } from "@/types/pages/todo-list/TodoListMessages-types";

interface Task {
  id: string;
  text: string;
  done: boolean;
  day: number;
  project: string;
}

const DAYS = [
  { index: 0, labelKey: "todoList7Day0", number: 9 },
  { index: 1, labelKey: "todoList7Day1", number: 10 },
  { index: 2, labelKey: "todoList7Day2", number: 11 },
  { index: 3, labelKey: "todoList7Day3", number: 12 },
  { index: 4, labelKey: "todoList7Day4", number: 13 },
  { index: 5, labelKey: "todoList7Day5", number: 14 },
  { index: 6, labelKey: "todoList7Day6", number: 15 },
] as const;

const SEED = [
  {
    id: "seed-1",
    textKey: "todoList7Task1",
    done: false,
    day: 1,
    projectKey: "todoList7Project1",
  },
  {
    id: "seed-2",
    textKey: "todoList7Task2",
    done: false,
    day: 1,
    projectKey: "todoList7Project2",
  },
  {
    id: "seed-3",
    textKey: "todoList7Task3",
    done: true,
    day: 2,
    projectKey: "todoList7Project1",
  },
  {
    id: "seed-4",
    textKey: "todoList7Task4",
    done: false,
    day: 3,
    projectKey: "todoList7Project3",
  },
  {
    id: "seed-5",
    textKey: "todoList7Task5",
    done: false,
    day: 3,
    projectKey: "todoList7Project2",
  },
  {
    id: "seed-6",
    textKey: "todoList7Task6",
    done: false,
    day: 4,
    projectKey: "todoList7Project1",
  },
] as const;

export function CalendarDayTodoList() {
  const t = useMessages("pages") as unknown as PagesWithTodoListMessages;
  const d = t.todoList;
  const [tasks, setTasks] = useState<Task[]>(() =>
    SEED.map((seed) => ({
      id: seed.id,
      text: d[seed.textKey],
      done: seed.done,
      day: seed.day,
      project: d[seed.projectKey],
    })),
  );
  const [selectedDay, setSelectedDay] = useState<number>(1);

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

  const dayTasks = tasks.filter((task) => task.day === selectedDay);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <Card variant="default">
          <CardHeader>
            <CardTitle>{d.todoList7Heading}</CardTitle>
            <CardDescription>{d.todoList7Subheading}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((day) => {
                const dayLabel = d[day.labelKey];
                const isSelected = selectedDay === day.index;
                const count = tasks.filter(
                  (task) => task.day === day.index,
                ).length;
                return (
                  <button
                    key={day.index}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={d.todoList7DaySelectAria.replace(
                      "{day}",
                      dayLabel,
                    )}
                    onClick={() => setSelectedDay(day.index)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border py-2 transition-colors",
                      isSelected
                        ? "border-brand bg-brand text-brand-fg"
                        : "border-border hover:bg-surface-hover text-fg",
                    )}
                  >
                    <span className="text-[10px] font-medium tracking-wide uppercase opacity-80">
                      {dayLabel}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {day.number}
                    </span>
                    {count > 0 && (
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          isSelected ? "bg-brand-fg" : "bg-brand",
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {dayTasks.length === 0 ? (
              <p className="text-muted py-6 text-center text-sm">
                {d.todoList7Empty}
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {dayTasks.map((task) => (
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
                      <Badge variant="outline" size="sm">
                        {task.project}
                      </Badge>
                      <IconButton
                        icon={<IconTrash size={15} aria-hidden="true" />}
                        label={d.todoList7DeleteAria.replace(
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
