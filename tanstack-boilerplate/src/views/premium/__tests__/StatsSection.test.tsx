import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StatsSection } from "../StatsSection";

const t = {
  loading: "Loading...",
  loadStats: "Load stats",
  exportCsv: "Export CSV",
  totalUsers: "Total users",
  activeUsers: "Active users",
  revenue: "Revenue",
} as unknown as Parameters<typeof StatsSection>[0]["t"];

const stats = { totalUsers: 10, activeUsers: 5, revenue: 99.9 };

describe("StatsSection export button visibility", () => {
  it("hides Export CSV until growth stats have also loaded, even though stats alone are ready", () => {
    render(
      <StatsSection
        stats={stats}
        loadingStats={false}
        onLoadStats={vi.fn()}
        onExportCSV={vi.fn()}
        hasGrowthStats={false}
        t={t}
      />,
    );

    expect(screen.queryByText("Export CSV")).toBeNull();
  });

  it("shows Export CSV once both stats and growth stats are loaded", () => {
    render(
      <StatsSection
        stats={stats}
        loadingStats={false}
        onLoadStats={vi.fn()}
        onExportCSV={vi.fn()}
        hasGrowthStats={true}
        t={t}
      />,
    );

    expect(screen.getByText("Export CSV")).toBeTruthy();
  });
});
