import { IconStarFilled } from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/Collapsible";
import { Chevron } from "@/views/ui/collapsible/Chevron";

const starredRepos = [
  { name: "@radix-ui/primitives", stars: "16.2k" },
  { name: "@tanstack/query", stars: "44.8k" },
  { name: "@vercel/next.js", stars: "132k" },
  { name: "@tailwindlabs/tailwindcss", stars: "87.5k" },
];

export function StarredReposTab() {
  const [firstRepo, ...moreRepos] = starredRepos;

  return (
    <Collapsible className="flex w-full max-w-sm flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-fg text-sm">
          <span className="font-semibold">berkay</span> starred{" "}
          {starredRepos.length} repositories
        </span>
        <CollapsibleTrigger
          aria-label="Toggle repository list"
          className="group text-muted hover:text-fg rounded-md p-1"
        >
          <Chevron />
        </CollapsibleTrigger>
      </div>
      <div className="bg-surface border-border flex items-center justify-between rounded-md border px-4 py-2">
        <span className="text-fg text-sm">{firstRepo.name}</span>
        <span className="text-muted flex items-center gap-1 text-xs">
          <IconStarFilled className="text-warning size-3" aria-hidden="true" />
          {firstRepo.stars}
        </span>
      </div>
      <CollapsibleContent className="flex flex-col gap-2">
        {moreRepos.map((repo) => (
          <div
            key={repo.name}
            className="bg-surface border-border flex items-center justify-between rounded-md border px-4 py-2"
          >
            <span className="text-fg text-sm">{repo.name}</span>
            <span className="text-muted flex items-center gap-1 text-xs">
              <IconStarFilled
                className="text-warning size-3"
                aria-hidden="true"
              />
              {repo.stars}
            </span>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
