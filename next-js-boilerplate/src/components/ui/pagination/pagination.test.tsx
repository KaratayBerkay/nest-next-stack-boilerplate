import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  Pagination,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ componentStyle: "default" as const }),
}));

describe("Pagination string overrides (A10)", () => {
  it("renders the default copy when no children are given", () => {
    render(<PaginationPrevious href="#" />);
    expect(screen.getByText("Previous")).toBeDefined();
  });

  it("renders custom children instead of the default copy", () => {
    render(<PaginationPrevious href="#">Önceki</PaginationPrevious>);
    expect(screen.getByText("Önceki")).toBeDefined();
    expect(screen.queryByText("Previous")).toBeNull();
  });

  it("lets a consumer aria-label override the built-in default", () => {
    render(
      <PaginationNext href="#" aria-label="Sonraki sayfa">
        Sonraki
      </PaginationNext>,
    );
    expect(screen.getByRole("link", { name: "Sonraki sayfa" })).toBeDefined();
  });

  it("lets a consumer aria-label override the nav default", () => {
    render(<Pagination aria-label="Sayfalama" />);
    expect(
      screen.getByRole("navigation", { name: "Sayfalama" }),
    ).toBeDefined();
  });
});
