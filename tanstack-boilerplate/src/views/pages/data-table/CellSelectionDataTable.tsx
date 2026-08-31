"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { IconX } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";
import type { Dispatch, SetStateAction } from "react";

interface CellSelectionPerson {
  id: string;
  nameKey: string;
  departmentKey: string;
  locationKey: string;
}

const SELECTABLE_PERSONS: CellSelectionPerson[] = [
  {
    id: "p1",
    nameKey: "dataTable28Row1Name",
    departmentKey: "dataTable28Dept1",
    locationKey: "dataTable28Loc1",
  },
  {
    id: "p2",
    nameKey: "dataTable28Row2Name",
    departmentKey: "dataTable28Dept2",
    locationKey: "dataTable28Loc2",
  },
  {
    id: "p3",
    nameKey: "dataTable28Row3Name",
    departmentKey: "dataTable28Dept3",
    locationKey: "dataTable28Loc1",
  },
  {
    id: "p4",
    nameKey: "dataTable28Row4Name",
    departmentKey: "dataTable28Dept2",
    locationKey: "dataTable28Loc3",
  },
  {
    id: "p5",
    nameKey: "dataTable28Row5Name",
    departmentKey: "dataTable28Dept1",
    locationKey: "dataTable28Loc3",
  },
];

function toggleCell(
  cellKey: string,
  setSelected: Dispatch<SetStateAction<Set<string>>>,
) {
  setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(cellKey)) {
      next.delete(cellKey);
    } else {
      next.add(cellKey);
    }
    return next;
  });
}

function clearSelection(setSelected: Dispatch<SetStateAction<Set<string>>>) {
  setSelected(new Set());
}

export function CellSelectionDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const counter = d.dataTable28Counter.replace("{n}", String(selected.size));

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable28Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable28TabDescription}
          </Typography>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-3">
              <span className="text-sm font-medium">{counter}</span>
              <span className="text-muted text-xs">{d.dataTable28Hint}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearSelection(setSelected)}
            >
              <IconX size={16} />
              {d.dataTable28Clear}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{d.dataTable28ColName}</TableHead>
                <TableHead>{d.dataTable28ColDepartment}</TableHead>
                <TableHead>{d.dataTable28ColLocation}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SELECTABLE_PERSONS.map((person) => (
                <TableRow key={person.id}>
                  <TableCell
                    onClick={() => toggleCell(`${person.id}-name`, setSelected)}
                    className={`cursor-pointer transition-colors ${selected.has(`${person.id}-name`) ? "bg-brand/10 text-brand" : ""}`}
                  >
                    {d[person.nameKey]}
                  </TableCell>
                  <TableCell
                    onClick={() => toggleCell(`${person.id}-dept`, setSelected)}
                    className={`cursor-pointer transition-colors ${selected.has(`${person.id}-dept`) ? "bg-brand/10 text-brand" : ""}`}
                  >
                    {d[person.departmentKey]}
                  </TableCell>
                  <TableCell
                    onClick={() => toggleCell(`${person.id}-loc`, setSelected)}
                    className={`cursor-pointer transition-colors ${selected.has(`${person.id}-loc`) ? "bg-brand/10 text-brand" : ""}`}
                  >
                    {d[person.locationKey]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
