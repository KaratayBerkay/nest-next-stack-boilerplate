"use client";
import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";

export function SortByTab() {
  const [sort, setSort] = useState("newest");

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">
        Compact toolbar dropdown (size sm) for ordering a feed.
      </p>
      <div className="flex items-center gap-2">
        <span className="text-muted text-sm">Sort by</span>
        <Dropdown
          aria-label="Sort by"
          size="sm"
          options={[
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "popular", label: "Most popular" },
            { value: "comments", label: "Most commented" },
          ]}
          value={sort}
          onChange={setSort}
          className="w-44"
        />
      </div>
    </div>
  );
}
