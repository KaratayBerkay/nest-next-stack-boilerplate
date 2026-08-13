"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  IconArrowRight,
  IconChevronRight,
  IconFile,
  IconFolder,
} from "@tabler/icons-react";
import { CodeBlock } from "@/views/ui/_shared/CodeBlock";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCodeExampleMessages } from "@/types/pages/code-example/CodeExampleMessages-types";

interface TreeNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: TreeNode[];
  code?: string;
}

const FILE_TREE: TreeNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "components",
        name: "components",
        type: "folder",
        children: [
          {
            id: "ui",
            name: "ui",
            type: "folder",
            children: [
              {
                id: "button",
                name: "button.tsx",
                type: "file",
                code: `import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-fg shadow-xs hover:bg-brand/90",
        outline: "border border-border bg-surface shadow-xs hover:bg-surface-hover",
        ghost: "hover:bg-surface-hover",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };`,
              },
            ],
          },
        ],
      },
      {
        id: "tsconfig",
        name: "tsconfig.json",
        type: "file",
        code: `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,
      },
    ],
  },
];

function findFile(nodes: TreeNode[], id: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findFile(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function handleToggle(
  id: string,
  setExpanded: Dispatch<SetStateAction<string[]>>,
) {
  setExpanded((prev) =>
    prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id],
  );
}

function renderNodes(
  nodes: TreeNode[],
  depth: number,
  expanded: string[],
  selectedId: string,
  onSelect: (id: string) => void,
  onToggle: (id: string) => void,
) {
  return nodes.map((node) => {
    const isFolder = node.type === "folder";
    const isExpanded = expanded.includes(node.id);
    const isSelected = node.id === selectedId;
    return (
      <div key={node.id} className="flex flex-col">
        <button
          type="button"
          onClick={() => (isFolder ? onToggle(node.id) : onSelect(node.id))}
          aria-expanded={isFolder ? isExpanded : undefined}
          className={cn(
            "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
            isSelected && !isFolder && "bg-surface-hover text-fg",
            !isSelected && "text-muted hover:bg-surface-hover hover:text-fg",
          )}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          {isFolder ? (
            <>
              <IconChevronRight
                className={cn(
                  "text-muted size-3.5 shrink-0 transition-transform",
                  isExpanded && "rotate-90",
                )}
              />
              <IconFolder className="text-brand size-4 shrink-0" />
            </>
          ) : (
            <IconFile className="text-muted size-4 shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {isFolder && isExpanded && node.children
          ? renderNodes(
              node.children,
              depth + 1,
              expanded,
              selectedId,
              onSelect,
              onToggle,
            )
          : null}
      </div>
    );
  });
}

export function FileTreePreview() {
  const t = useMessages("pages") as unknown as PagesWithCodeExampleMessages;
  const co = t.codeExample;
  const [selectedId, setSelectedId] = useState("button");
  const [expanded, setExpanded] = useState<string[]>([
    "src",
    "components",
    "ui",
  ]);
  const selectedFile = findFile(FILE_TREE, selectedId);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-muted mb-6 block text-xs font-medium tracking-widest uppercase">
            {co["codeExample4Tag"]}
          </span>
          <h2 className="text-fg mb-4 text-4xl font-semibold tracking-tight">
            {co["codeExample4Title"]}
          </h2>
          <p className="text-muted mx-auto max-w-3xl text-lg">
            {co["codeExample4Description"]}
          </p>
        </div>
        <div className="grid lg:grid-cols-[300px_1fr]">
          <div className="border-border bg-surface border p-4 lg:rounded-l-xl lg:border-r-0">
            {renderNodes(
              FILE_TREE,
              0,
              expanded,
              selectedId,
              setSelectedId,
              (id) => handleToggle(id, setExpanded),
            )}
          </div>
          <CodeBlock
            code={selectedFile?.code ?? ""}
            className="rounded-t-none lg:rounded-t-xl lg:rounded-l-none"
          />
        </div>
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            rightIcon={<IconArrowRight className="h-4 w-4" />}
          >
            {co["codeExample4DocsButton"]}
          </Button>
        </div>
      </div>
    </section>
  );
}
