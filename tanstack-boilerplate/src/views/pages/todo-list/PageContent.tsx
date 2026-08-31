"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { SimpleChecklistTodoList } from "./SimpleChecklistTodoList";
import { DragHandleReorderTodoList } from "./DragHandleReorderTodoList";
import { TabbedStatusTodoList } from "./TabbedStatusTodoList";
import { ProgressComposerTodoList } from "./ProgressComposerTodoList";
import { SwipeActionRowTodoList } from "./SwipeActionRowTodoList";
import { PriorityGroupedTodoList } from "./PriorityGroupedTodoList";
import { CalendarDayTodoList } from "./CalendarDayTodoList";
import { NestedSubtasksTodoList } from "./NestedSubtasksTodoList";
import { TagFilterSearchTodoList } from "./TagFilterSearchTodoList";
import { KanbanBoardTodoList } from "./KanbanBoardTodoList";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function TodoListPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.todoList;

  const examples: UIExample[] = [
    {
      id: "todo-list-1",
      title: t.todoList1TabTitle,
      description: t.todoList1TabDescription,
      render: () => <SimpleChecklistTodoList />,
    },
    {
      id: "todo-list-2",
      title: t.todoList2TabTitle,
      description: t.todoList2TabDescription,
      render: () => <DragHandleReorderTodoList />,
    },
    {
      id: "todo-list-3",
      title: t.todoList3TabTitle,
      description: t.todoList3TabDescription,
      render: () => <TabbedStatusTodoList />,
    },
    {
      id: "todo-list-4",
      title: t.todoList4TabTitle,
      description: t.todoList4TabDescription,
      render: () => <ProgressComposerTodoList />,
    },
    {
      id: "todo-list-5",
      title: t.todoList5TabTitle,
      description: t.todoList5TabDescription,
      render: () => <SwipeActionRowTodoList />,
    },
    {
      id: "todo-list-6",
      title: t.todoList6TabTitle,
      description: t.todoList6TabDescription,
      render: () => <PriorityGroupedTodoList />,
    },
    {
      id: "todo-list-7",
      title: t.todoList7TabTitle,
      description: t.todoList7TabDescription,
      render: () => <CalendarDayTodoList />,
    },
    {
      id: "todo-list-8",
      title: t.todoList8TabTitle,
      description: t.todoList8TabDescription,
      render: () => <NestedSubtasksTodoList />,
    },
    {
      id: "todo-list-9",
      title: t.todoList9TabTitle,
      description: t.todoList9TabDescription,
      render: () => <TagFilterSearchTodoList />,
    },
    {
      id: "todo-list-10",
      title: t.todoList10TabTitle,
      description: t.todoList10TabDescription,
      render: () => <KanbanBoardTodoList />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.todoListTitle}
      intro={m.examples.todoListDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="todo-list"
    />
  );
}
