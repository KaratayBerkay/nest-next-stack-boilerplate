import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { EditorEffects } from "./EditorEffects";
import type { DraftValues } from "./draft-utils";

const saveDraftMock = vi.hoisted(() => vi.fn());

vi.mock("./draft-utils", async () => {
  const actual =
    await vi.importActual<typeof import("./draft-utils")>("./draft-utils");
  return { ...actual, saveDraft: saveDraftMock };
});

function makeValues(title: string): DraftValues {
  return { title, slug: title.toLowerCase(), tags: [], body: "" };
}

describe("EditorEffects autosave interval", () => {
  afterEach(() => {
    vi.useRealTimers();
    saveDraftMock.mockReset();
  });

  it("still autosaves after 30s of active typing, instead of the interval resetting on every keystroke", () => {
    vi.useFakeTimers();
    const dirtyRef = { current: true };
    const slugEditedByUser = { current: false };

    const { rerender } = render(
      <EditorEffects
        draftKey="draft-1"
        values={makeValues("a")}
        formSetFieldValue={vi.fn()}
        dirtyRef={dirtyRef}
        slugEditedByUser={slugEditedByUser}
      />,
    );

    // Simulate active typing: a new `values` object every 5s, well under
    // the 30s interval, for the full 30s window.
    for (let i = 2; i <= 7; i++) {
      vi.advanceTimersByTime(5000);
      rerender(
        <EditorEffects
          draftKey="draft-1"
          values={makeValues("a".repeat(i))}
          formSetFieldValue={vi.fn()}
          dirtyRef={dirtyRef}
          slugEditedByUser={slugEditedByUser}
        />,
      );
    }

    expect(saveDraftMock).toHaveBeenCalledTimes(1);
    expect(saveDraftMock).toHaveBeenCalledWith(
      "draft-1",
      expect.objectContaining({ title: "aaaaaa" }),
    );
  });

  it("does not autosave when there is no title", () => {
    vi.useFakeTimers();
    const dirtyRef = { current: false };
    const slugEditedByUser = { current: false };

    render(
      <EditorEffects
        draftKey="draft-1"
        values={makeValues("")}
        formSetFieldValue={vi.fn()}
        dirtyRef={dirtyRef}
        slugEditedByUser={slugEditedByUser}
      />,
    );

    vi.advanceTimersByTime(30000);

    expect(saveDraftMock).not.toHaveBeenCalled();
  });
});
