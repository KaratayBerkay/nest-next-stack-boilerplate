"use client";
import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { UploadFile } from "@/types/ui/FileUpload-types";

function simulateUpload(file: File, reportProgress: (pct: number) => void) {
  return new Promise<void>((resolve) => {
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.floor(Math.random() * 30) + 5;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        resolve();
      }
      reportProgress(Math.min(pct, 100));
    }, 300);
  });
}

function BasicUploadTab() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <div className="flex flex-col gap-3 max-w-md">
      <FileUpload
        files={files}
        onFilesChange={setFiles}
        onUpload={simulateUpload}
      />
    </div>
  );
}

function MultiUploadTab() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <div className="flex flex-col gap-3 max-w-md">
      <p className="text-muted text-xs">
        Drop multiple files at once. Each file shows its own progress bar.
      </p>
      <FileUpload
        multiple
        files={files}
        onFilesChange={setFiles}
        onUpload={simulateUpload}
      />
    </div>
  );
}

function ValidationTab() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <div className="flex flex-col gap-3 max-w-md">
      <p className="text-muted text-xs">
        Accepts only images under 1 MB, max 3 files. Invalid files are rejected.
      </p>
      <FileUpload
        multiple
        accept="image/*"
        maxSizeBytes={1_048_576}
        maxFiles={3}
        files={files}
        onFilesChange={setFiles}
        onUpload={simulateUpload}
      />
    </div>
  );
}

function DisabledTab() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <div className="flex flex-col gap-3 max-w-md">
      <FileUpload
        disabled
        files={files}
        onFilesChange={setFiles}
      />
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "basic",
    title: "Single Upload",
    description: "Upload one file at a time. Click the upload button to simulate progress.",
    render: () => <BasicUploadTab />,
  },
  {
    id: "multi",
    title: "Multi Upload",
    description: "Drag and drop multiple files with individual progress tracking.",
    render: () => <MultiUploadTab />,
  },
  {
    id: "validation",
    title: "With Validation",
    description: "Restricted to images under 1 MB, max 3 files. Invalid files show inline errors.",
    render: () => <ValidationTab />,
  },
  {
    id: "disabled",
    title: "Disabled",
    description: "Upload field in disabled state — no interactions allowed.",
    render: () => <DisabledTab />,
  },
];

export default function FileUploadPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="File Upload"
      intro="A dropzone-based file uploader with drag-and-drop, validation, progress bars, and remove actions."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
