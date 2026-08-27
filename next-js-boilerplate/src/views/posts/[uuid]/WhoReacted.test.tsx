import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { WhoReacted } from "./WhoReacted";
import type { Post } from "@/types/posts/Post-types";

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => ({ whoReacted: "Who Reacted", unknown: "Unknown" }),
}));
vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: () => "default",
}));

function makePost(whoReacted: Post["whoReacted"]): Post {
  return { whoReacted } as Post;
}

describe("WhoReacted", () => {
  it("renders each reaction's emoji instead of the raw backend enum value", () => {
    render(
      <WhoReacted
        post={makePost([
          { userId: "u1", name: "Alice", type: "LIKE" },
          { userId: "u2", name: "Bob", type: "LOVE" },
        ])}
      />,
    );

    expect(screen.getByText("👍")).toBeTruthy();
    expect(screen.getByText("❤️")).toBeTruthy();
    expect(screen.queryByText("LIKE")).toBeNull();
    expect(screen.queryByText("LOVE")).toBeNull();
  });

  it("falls back to the raw value for an unrecognized reaction type", () => {
    render(
      <WhoReacted
        post={makePost([{ userId: "u1", name: "Alice", type: "MYSTERY" }])}
      />,
    );

    expect(screen.getByText("MYSTERY")).toBeTruthy();
  });
});
