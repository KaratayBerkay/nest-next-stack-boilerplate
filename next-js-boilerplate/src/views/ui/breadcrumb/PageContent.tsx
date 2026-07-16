"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbPage as ShadBreadcrumbPage,
} from "@/components/ui/Breadcrumb";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const folderMap: Record<string, string[]> = {
  Home: ["Projects", "Documents", "Downloads"],
  Projects: ["Website", "Mobile App"],
  Documents: ["Reports", "Invoices"],
  Downloads: ["Images", "PDFs"],
  Website: ["Assets", "Source"],
  "Mobile App": ["Screens", "Backend"],
  Assets: ["Icons", "Logos"],
  Source: ["Components", "Utils"],
  Reports: ["Q1", "Q2"],
  Invoices: ["2024", "2025"],
  Images: ["Screenshots", "Photos"],
  PDFs: ["Manuals", "Forms"],
};

function handleCrumbClick(
  index: number,
  setCurrentPath: Dispatch<SetStateAction<string[]>>,
) {
  setCurrentPath((prev) => prev.slice(0, index + 1));
}

function handleFolderClick(
  folder: string,
  setCurrentPath: Dispatch<SetStateAction<string[]>>,
) {
  setCurrentPath((prev) => [...prev, folder]);
}

function FolderContent({
  currentFolder,
  onFolderClick,
}: {
  currentFolder: string;
  onFolderClick: (folder: string) => void;
}) {
  const items = folderMap[currentFolder];

  if (!items || items.length === 0) {
    return (
      <div className="border-border text-muted rounded-md border p-8 text-center text-sm">
        This folder is empty.
      </div>
    );
  }

  return (
    <div className="border-border flex flex-col gap-3 rounded-md border p-4">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onFolderClick(item)}
          className="hover:bg-surface-hover text-fg flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          {item}
        </button>
      ))}
    </div>
  );
}

function FolderExplorer() {
  const [currentPath, setCurrentPath] = useState(["Home"]);
  const currentFolder = currentPath[currentPath.length - 1];

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Folder Explorer</h3>
        <Breadcrumb>
          <BreadcrumbList>
            {currentPath.map((crumb, index) => (
              <BreadcrumbItem key={crumb}>
                {index < currentPath.length - 1 ? (
                  <>
                    <BreadcrumbLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCrumbClick(index, setCurrentPath);
                      }}
                    >
                      {crumb}
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                ) : (
                  <ShadBreadcrumbPage>{crumb}</ShadBreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <FolderContent
          currentFolder={currentFolder}
          onFolderClick={(folder) =>
            handleFolderClick(folder, setCurrentPath)
          }
        />
      </section>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Deep Path",
    description: "Breadcrumb with collapsed middle items in an ellipsis menu.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <ShadBreadcrumbPage>Components</ShadBreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Folder Explorer",
    description: "Folder explorer breadcrumb that changes context in-place.",
    render: () => <FolderExplorer />,
  },
];

export default function BreadcrumbPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Breadcrumb"
      intro="Navigation hierarchy indicator."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
