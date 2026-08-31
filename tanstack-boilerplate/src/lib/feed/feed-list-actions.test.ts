import { describe, it, expect } from "vitest";
import { mergeFeedPosts } from "./feed-list-actions";
import type { Post } from "@/types/feed/PostCard-types";

function makePost(id: string): Post {
  return {
    id,
    title: `Post ${id}`,
    content: "content",
    createdAt: new Date().toISOString(),
    author: { id: "u1", name: "Author", email: "a@b.com" },
  };
}

describe("mergeFeedPosts", () => {
  it("concatenates page posts and extra posts with no overlap", () => {
    const merged = mergeFeedPosts(
      [makePost("1"), makePost("2")],
      [makePost("3"), makePost("4")],
    );
    expect(merged.map((p) => p.id)).toEqual(["1", "2", "3", "4"]);
  });

  it("drops a post from extraPosts that also reappears in the refetched page — the exact regression this fixes", () => {
    // Deleting post "2" shifts "6" (previously loaded via infinite scroll,
    // still sitting in extraPosts) into page 1's refetched result.
    const merged = mergeFeedPosts(
      [makePost("1"), makePost("3"), makePost("6")],
      [makePost("6"), makePost("7")],
    );
    expect(merged.map((p) => p.id)).toEqual(["1", "3", "6", "7"]);
  });

  it("keeps the page-1 copy, not the extraPosts copy, when both are present", () => {
    const pageCopy = { ...makePost("1"), title: "fresh from page 1" };
    const staleCopy = { ...makePost("1"), title: "stale from extraPosts" };
    const merged = mergeFeedPosts([pageCopy], [staleCopy]);
    expect(merged).toHaveLength(1);
    expect(merged[0].title).toBe("fresh from page 1");
  });
});
