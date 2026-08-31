"use client";

import {
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import {
  IconCheck,
  IconCopy,
  IconFolder,
  IconPencil,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { Accordion, AccordionItemComplex } from "@/components/ui/accordion";
import { Button, IconButton } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCodeExampleMessages } from "@/types/pages/code-example/CodeExampleMessages-types";
import { useScrollFadeX } from "@/hooks/useScrollFadeX";

interface CodeExample14Operation {
  id: string;
  icon: ReactNode;
  titleKey: string;
  contentKey: string;
  filename: string;
  code: string;
}

const CODE_EXAMPLE_14_OPERATIONS: CodeExample14Operation[] = [
  {
    id: "create",
    icon: <IconUpload size={16} />,
    titleKey: "codeExample14CreateTitle",
    contentKey: "codeExample14CreateDescription",
    filename: "file-service.ts",
    code: `import { createFile } from "@acme/storage";

const file = await createFile({
  name: "report.pdf",
  folderId: "folder_8f2a",
  content: Buffer.from("Q4 earnings report"),
  public: false,
});

console.log(file.id, file.size);`,
  },
  {
    id: "update",
    icon: <IconPencil size={16} />,
    titleKey: "codeExample14UpdateTitle",
    contentKey: "codeExample14UpdateDescription",
    filename: "file-service.ts",
    code: `import { updateFile } from "@acme/storage";

const file = await updateFile("file_1c93", {
  name: "report-final.pdf",
  folderId: "folder_8f2a",
  public: true,
});

console.log(file.updatedAt);`,
  },
  {
    id: "delete",
    icon: <IconTrash size={16} />,
    titleKey: "codeExample14DeleteTitle",
    contentKey: "codeExample14DeleteDescription",
    filename: "file-service.ts",
    code: `import { deleteFile } from "@acme/storage";

await deleteFile("file_1c93");

console.log("File moved to trash");`,
  },
];

function handleCopy(
  code: string,
  setCopied: Dispatch<SetStateAction<boolean>>,
) {
  navigator.clipboard.writeText(code);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}

export function FileOpsAccordion() {
  const scrollFadeRef = useScrollFadeX<HTMLPreElement>();
  const m = useMessages("pages") as unknown as PagesWithCodeExampleMessages;
  const co = m.codeExample;
  const [activeOperationId, setActiveOperationId] = useState("create");
  const [copied, setCopied] = useState(false);

  const activeOperation =
    CODE_EXAMPLE_14_OPERATIONS.find(
      (operation) => operation.id === activeOperationId,
    ) ?? CODE_EXAMPLE_14_OPERATIONS[0];

  return (
    <section className="relative w-full py-16 lg:py-24">
      <div className="bg-brand/5 pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 w-[36rem] max-w-full rounded-full blur-3xl" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="border-border bg-surface text-muted inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <IconFolder size={14} className="text-brand" />
            {co["codeExample14Badge"]}
          </span>
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {co["codeExample14Title"]}
          </h2>
          <p className="text-muted text-lg">{co["codeExample14Description"]}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button>{co["codeExample14PrimaryButton"]}</Button>
            <Button variant="outline">
              {co["codeExample14SecondaryButton"]}
            </Button>
          </div>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Accordion
            type="single"
            collapsible
            value={activeOperationId}
            onValueChange={setActiveOperationId}
            className="w-full"
          >
            {CODE_EXAMPLE_14_OPERATIONS.map((operation) => (
              <AccordionItemComplex
                key={operation.id}
                value={operation.id}
                leftSlot={
                  <div className="border-border bg-surface flex size-9 items-center justify-center rounded-lg border">
                    <span className="text-brand">{operation.icon}</span>
                  </div>
                }
                centerSlot={
                  <span className="font-medium">{co[operation.titleKey]}</span>
                }
                content={
                  <p className="text-muted">{co[operation.contentKey]}</p>
                }
              />
            ))}
          </Accordion>
          <div className="border-border bg-surface overflow-hidden rounded-2xl border">
            <div className="border-border flex items-center justify-between border-b px-4 py-3">
              <span className="text-muted font-mono text-xs">
                {activeOperation.filename}
              </span>
              <IconButton
                icon={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                variant="ghost"
                size="icon-xs"
                label={
                  copied
                    ? co["codeExample14CopiedLabel"]
                    : co["codeExample14CopyLabel"]
                }
                onClick={() => handleCopy(activeOperation.code, setCopied)}
              />
            </div>
            <pre
              ref={scrollFadeRef}
              className="overflow-x-auto p-4 font-mono text-sm leading-relaxed"
            >
              <code>{activeOperation.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
