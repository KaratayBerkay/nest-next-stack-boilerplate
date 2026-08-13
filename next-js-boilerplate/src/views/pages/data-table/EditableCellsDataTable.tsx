"use client";

import { useRef, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import { IconPencil } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";

interface EditableRow {
  id: string;
  nameKey: string;
  department: string;
  email: string;
}

interface EditDraft {
  department: string;
  email: string;
}

function startEdit(
  row: EditableRow,
  department: string,
  email: string,
  setEditingId: (id: string | null) => void,
  setDraft: (draft: EditDraft) => void,
) {
  setEditingId(row.id);
  setDraft({ department, email });
}

function commitEdit(
  id: string,
  draft: EditDraft,
  setRows: Dispatch<SetStateAction<EditableRow[]>>,
  setEditingId: (id: string | null) => void,
) {
  setRows((prev) =>
    prev.map((row) =>
      row.id === id
        ? { ...row, department: draft.department, email: draft.email }
        : row,
    ),
  );
  setEditingId(null);
}

function cancelEdit(setEditingId: (id: string | null) => void) {
  setEditingId(null);
}

function handleEditKeyDown(
  event: React.KeyboardEvent<HTMLInputElement>,
  cancelledRef: MutableRefObject<boolean>,
  onCommit: () => void,
  onCancel: () => void,
) {
  if (event.key === "Enter") {
    cancelledRef.current = true;
    onCommit();
  } else if (event.key === "Escape") {
    cancelledRef.current = true;
    onCancel();
  }
}

function handleEditBlur(
  cancelledRef: MutableRefObject<boolean>,
  onCommit: () => void,
) {
  if (cancelledRef.current) {
    return;
  }
  onCommit();
}

function EditableCellInput({
  draft,
  field,
  onDraft,
  onCommit,
  onCancel,
}: {
  draft: EditDraft;
  field: "department" | "email";
  onDraft: (draft: EditDraft) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  const cancelledRef = useRef(false);
  const value = field === "department" ? draft.department : draft.email;

  return (
    <Input
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
      value={value}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) =>
        onDraft(
          field === "department"
            ? { ...draft, department: event.target.value }
            : { ...draft, email: event.target.value },
        )
      }
      onKeyDown={(event) =>
        handleEditKeyDown(event, cancelledRef, onCommit, onCancel)
      }
      onBlur={() => handleEditBlur(cancelledRef, onCommit)}
      className="h-8 text-sm"
      type={field === "email" ? "email" : "text"}
    />
  );
}

export function EditableCellsDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;

  const [rows, setRows] = useState<EditableRow[]>(
    EDITABLE_ROWS.map((row, index) => ({
      ...row,
      department: d[`dataTable29Row${index + 1}Department`],
      email: d[`dataTable29Row${index + 1}Email`],
    })),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft>({ department: "", email: "" });

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable29Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable29TabDescription}
          </Typography>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={4}>
                <span className="text-muted text-xs font-normal normal-case">
                  {d.dataTable29Hint}
                </span>
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead>{d.dataTable29ColName}</TableHead>
              <TableHead>{d.dataTable29ColDepartment}</TableHead>
              <TableHead>{d.dataTable29ColEmail}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{d[row.nameKey]}</TableCell>
                <TableCell className="group/editable">
                  {editingId === row.id ? (
                    <EditableCellInput
                      draft={draft}
                      field="department"
                      onDraft={setDraft}
                      onCommit={() =>
                        commitEdit(row.id, draft, setRows, setEditingId)
                      }
                      onCancel={() => cancelEdit(setEditingId)}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        startEdit(
                          row,
                          row.department,
                          row.email,
                          setEditingId,
                          setDraft,
                        )
                      }
                      className="hover:text-fg inline-flex items-center gap-2 text-left text-sm"
                    >
                      {row.department}
                      <IconPencil
                        size={14}
                        className="text-muted opacity-0 transition-opacity group-hover/editable:opacity-100"
                      />
                    </button>
                  )}
                </TableCell>
                <TableCell className="group/editable">
                  {editingId === row.id ? (
                    <EditableCellInput
                      draft={draft}
                      field="email"
                      onDraft={setDraft}
                      onCommit={() =>
                        commitEdit(row.id, draft, setRows, setEditingId)
                      }
                      onCancel={() => cancelEdit(setEditingId)}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        startEdit(
                          row,
                          row.department,
                          row.email,
                          setEditingId,
                          setDraft,
                        )
                      }
                      className="text-muted hover:text-fg inline-flex items-center gap-2 text-left text-sm"
                    >
                      {row.email}
                      <IconPencil
                        size={14}
                        className="text-muted opacity-0 transition-opacity group-hover/editable:opacity-100"
                      />
                    </button>
                  )}
                </TableCell>
                <TableCell className="text-right text-sm">
                  <button
                    type="button"
                    aria-label={d.dataTable29EditLabel}
                    onClick={() =>
                      startEdit(
                        row,
                        row.department,
                        row.email,
                        setEditingId,
                        setDraft,
                      )
                    }
                    className="text-muted hover:text-fg"
                  >
                    <IconPencil size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

const EDITABLE_ROWS: EditableRow[] = [
  { id: "e1", nameKey: "dataTable29Row1Name", department: "", email: "" },
  { id: "e2", nameKey: "dataTable29Row2Name", department: "", email: "" },
  { id: "e3", nameKey: "dataTable29Row3Name", department: "", email: "" },
  { id: "e4", nameKey: "dataTable29Row4Name", department: "", email: "" },
];
