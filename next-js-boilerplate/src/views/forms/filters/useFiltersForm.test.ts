import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFiltersForm } from "./useFiltersForm";

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => ({}),
}));

describe("useFiltersForm handleReset", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/search");
  });

  it("resets the form to blank values, not back to defaultValues (the URL params the page loaded with)", () => {
    const { result } = renderHook(() =>
      useFiltersForm({ status: "active", sortBy: "date" }, "/search"),
    );
    const resetSpy = vi.spyOn(result.current.form, "reset");

    act(() => {
      result.current.handleReset();
    });

    expect(resetSpy).toHaveBeenCalledWith({
      search: "",
      tags: [],
      sortBy: "relevance",
      sortOrder: "desc",
      status: "",
      pageSize: "25",
      category: [],
      dateFrom: "",
      dateTo: "",
    });
  });

  it("clears the URL query string on reset", () => {
    const { result } = renderHook(() =>
      useFiltersForm({ status: "active" }, "/search"),
    );

    act(() => {
      result.current.handleReset();
    });

    expect(window.location.search).toBe("");
  });
});
