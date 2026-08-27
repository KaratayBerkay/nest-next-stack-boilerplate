import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ReactionInline } from "../ReactionButtons";

const t = {
  reactToPost: "REACT_TO_POST_LABEL",
  reactFailed: "REACT_FAILED",
};

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => t,
}));
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock("@/api/client/posts/actions", () => ({
  usePostActions: () => ({ toggleReaction: vi.fn() }),
}));
vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: () => "default",
}));

describe("ReactionInline", () => {
  it("labels the trigger with the translated aria-label, not a hardcoded one", () => {
    render(<ReactionInline reactions={[]} currentUserId="u1" />);

    expect(screen.getByLabelText("REACT_TO_POST_LABEL")).toBeTruthy();
    expect(screen.queryByLabelText("React to this post")).toBeNull();
  });
});
