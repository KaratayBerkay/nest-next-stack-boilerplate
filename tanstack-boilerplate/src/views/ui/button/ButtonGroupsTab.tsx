"use client";

import { useState } from "react";
import { ButtonGroup, ButtonGroupItem } from "@/components/ui/Button";

export function ButtonGroupsTab() {
  const [viewMode, setViewMode] = useState("list");
  const [align, setAlign] = useState("left");

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Horizontal</h3>
        <ButtonGroup>
          <ButtonGroupItem
            active={viewMode === "list"}
            onClick={() => setViewMode("list")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            List
          </ButtonGroupItem>
          <ButtonGroupItem
            active={viewMode === "grid"}
            onClick={() => setViewMode("grid")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Grid
          </ButtonGroupItem>
          <ButtonGroupItem
            active={viewMode === "card"}
            onClick={() => setViewMode("card")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="2" y1="9" x2="22" y2="9" />
            </svg>
            Card
          </ButtonGroupItem>
        </ButtonGroup>
        <p className="text-muted text-xs">View: {viewMode}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Vertical</h3>
        <ButtonGroup orientation="vertical">
          <ButtonGroupItem
            active={align === "left"}
            onClick={() => setAlign("left")}
            orientation="vertical"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 10H3" />
              <path d="M21 6H3" />
              <path d="M21 14H3" />
              <path d="M17 18H3" />
            </svg>
            Left Align
          </ButtonGroupItem>
          <ButtonGroupItem
            active={align === "center"}
            onClick={() => setAlign("center")}
            orientation="vertical"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 10H7" />
              <path d="M21 6H3" />
              <path d="M21 14H3" />
              <path d="M17 18H7" />
            </svg>
            Center Align
          </ButtonGroupItem>
          <ButtonGroupItem
            active={align === "right"}
            onClick={() => setAlign("right")}
            orientation="vertical"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10H7" />
              <path d="M21 6H3" />
              <path d="M21 14H3" />
              <path d="M21 18H7" />
            </svg>
            Right Align
          </ButtonGroupItem>
        </ButtonGroup>
        <p className="text-muted text-xs">Align: {align}</p>
      </section>
    </div>
  );
}
