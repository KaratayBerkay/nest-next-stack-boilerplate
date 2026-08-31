"use client";
import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";

export function RowsPerPageTab() {
  const [perPage, setPerPage] = useState("25");

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">Table footer control: rows per page.</p>
      <div className="flex items-center gap-2">
        <Dropdown
          aria-label="Rows per page"
          size="sm"
          options={["10", "25", "50", "100"].map((n) => ({
            value: n,
            label: n,
          }))}
          value={perPage}
          onChange={setPerPage}
          className="w-20"
        />
        <span className="text-muted text-sm">rows per page</span>
      </div>
    </div>
  );
}
