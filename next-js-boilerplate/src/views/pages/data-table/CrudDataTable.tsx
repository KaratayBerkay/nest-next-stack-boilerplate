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
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Typography } from "@/components/ui/Typography";
import {
  IconCheck,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";

interface CrudRow {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface CrudDraft {
  name: string;
  email: string;
  department: string;
}

const EMPTY_DRAFT: CrudDraft = { name: "", email: "", department: "" };

const CRUD_INITIAL_IDS = ["1", "2", "3", "4"] as const;

function beginAdd(
  setAdding: (adding: boolean) => void,
  setDraft: (draft: CrudDraft) => void,
) {
  setDraft(EMPTY_DRAFT);
  setAdding(true);
}

function submitAdd(
  draft: CrudDraft,
  setRows: Dispatch<SetStateAction<CrudRow[]>>,
  setAdding: (adding: boolean) => void,
) {
  if (!draft.name.trim() || !draft.email.trim()) {
    return;
  }
  setRows((prev) => [...prev, { id: `crud-${Date.now()}`, ...draft }]);
  setAdding(false);
}

function removeRow(id: string, setRows: Dispatch<SetStateAction<CrudRow[]>>) {
  setRows((prev) => prev.filter((row) => row.id !== id));
}

function startEdit(
  row: CrudRow,
  setEditingId: (id: string | null) => void,
  setDraft: (draft: CrudDraft) => void,
) {
  setEditingId(row.id);
  setDraft({ name: row.name, email: row.email, department: row.department });
}

function commitEdit(
  id: string,
  draft: CrudDraft,
  setRows: Dispatch<SetStateAction<CrudRow[]>>,
  setEditingId: (id: string | null) => void,
) {
  setRows((prev) =>
    prev.map((row) => (row.id === id ? { ...row, ...draft } : row)),
  );
  setEditingId(null);
}

function cancelEdit(setEditingId: (id: string | null) => void) {
  setEditingId(null);
}

function handleFieldKeyDown(
  event: React.KeyboardEvent<HTMLInputElement>,
  onCommit: () => void,
  onCancel: () => void,
) {
  if (event.key === "Enter") {
    onCommit();
  } else if (event.key === "Escape") {
    onCancel();
  }
}

function guardAction(
  cancelledRef: MutableRefObject<boolean>,
  action: () => void,
) {
  return () => {
    cancelledRef.current = true;
    action();
  };
}

export function CrudDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;

  const [rows, setRows] = useState<CrudRow[]>(
    CRUD_INITIAL_IDS.map((id) => ({
      id,
      name: d[`dataTable31Row${id}Name`],
      email: d[`dataTable31Row${id}Email`],
      department: d[`dataTable31Row${id}Department`],
    })),
  );
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<CrudDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<CrudDraft>(EMPTY_DRAFT);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable31Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable31TabDescription}
          </Typography>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted text-sm">
              {d.dataTable31RowCount.replace("{n}", String(rows.length))}
            </span>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<IconPlus size={16} />}
              onClick={() => beginAdd(setAdding, setDraft)}
            >
              {d.dataTable31AddRow}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{d.dataTable31ColName}</TableHead>
                <TableHead>{d.dataTable31ColEmail}</TableHead>
                <TableHead>{d.dataTable31ColDepartment}</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {adding && (
                <RowEditorRow
                  draft={draft}
                  onDraft={setDraft}
                  onCommit={() => submitAdd(draft, setRows, setAdding)}
                  onCancel={() => setAdding(false)}
                  placeholders={{
                    name: d.dataTable31NamePlaceholder,
                    email: d.dataTable31EmailPlaceholder,
                    department: d.dataTable31DepartmentPlaceholder,
                  }}
                  addLabel={d.dataTable31Add}
                  cancelAria={d.dataTable31Cancel}
                  commitOnBlur={false}
                />
              )}
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {editingId === row.id ? (
                    <RowEditorRow
                      draft={editDraft}
                      onDraft={setEditDraft}
                      onCommit={() =>
                        commitEdit(row.id, editDraft, setRows, setEditingId)
                      }
                      onCancel={() => cancelEdit(setEditingId)}
                      cancelAria={d.dataTable31Cancel}
                    />
                  ) : (
                    <>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-muted">{row.email}</TableCell>
                      <TableCell>{row.department}</TableCell>
                      <TableCell className="text-right">
                        <span className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={d.dataTable31EditLabel}
                            leftIcon={<IconPencil size={16} />}
                            onClick={() =>
                              startEdit(row, setEditingId, setEditDraft)
                            }
                            className="p-1.5"
                          />
                          <ConfirmDialog
                            title={d.dataTable31DeleteTitle}
                            description={d.dataTable31DeleteDescription}
                            confirmLabel={d.dataTable31DeleteLabel}
                            cancelLabel={d.dataTable31Cancel}
                            onConfirm={() => removeRow(row.id, setRows)}
                          >
                            {(open) => (
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={d.dataTable31DeleteLabel}
                                leftIcon={<IconTrash size={16} />}
                                onClick={open}
                                className="text-error hover:text-error p-1.5"
                              />
                            )}
                          </ConfirmDialog>
                        </span>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
              {rows.length === 0 && !adding && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted h-24 text-center"
                  >
                    {d.dataTable31Empty}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

function RowEditorRow({
  draft,
  onDraft,
  onCommit,
  onCancel,
  placeholders,
  addLabel,
  cancelAria,
  commitOnBlur = true,
}: {
  draft: CrudDraft;
  onDraft: (draft: CrudDraft) => void;
  onCommit: () => void;
  onCancel: () => void;
  placeholders?: CrudDraft;
  addLabel?: string;
  cancelAria: string;
  commitOnBlur?: boolean;
}) {
  const cancelledRef = useRef(false);
  const fields: { key: keyof CrudDraft; type?: string }[] = [
    { key: "name" },
    { key: "email", type: "email" },
    { key: "department" },
  ];

  return (
    <>
      {fields.map(({ key, type }, index) => (
        <TableCell key={key}>
          <Input
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={index === 0}
            type={type}
            value={draft[key]}
            placeholder={placeholders?.[key]}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) =>
              onDraft({ ...draft, [key]: event.target.value })
            }
            onKeyDown={(event) =>
              handleFieldKeyDown(
                event,
                guardAction(cancelledRef, onCommit),
                guardAction(cancelledRef, onCancel),
              )
            }
            onBlur={() => {
              if (cancelledRef.current || !commitOnBlur) {
                return;
              }
              onCommit();
            }}
            className="h-8 text-sm"
          />
        </TableCell>
      ))}
      <TableCell className="text-right">
        <span className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label={cancelAria}
            onClick={onCancel}
            className="p-1.5"
          >
            <IconX size={16} />
          </Button>
          {addLabel && (
            <Button
              variant="default"
              size="sm"
              leftIcon={<IconCheck size={16} />}
              onClick={onCommit}
              className="p-1.5"
            >
              {addLabel}
            </Button>
          )}
        </span>
      </TableCell>
    </>
  );
}
