"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

const codeString = `function StatCard({ title, value, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
          <span className={trend > 0 ? "text-success" : "text-error"}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </CardContent>
    </Card>
  );
}`;

export function CodePreviewTab() {
  const [mode, setMode] = useState<"preview" | "code">("preview");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={mode === "preview" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("preview")}
        >
          Preview
        </Button>
        <Button
          variant={mode === "code" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("code")}
        >
          Code
        </Button>
      </div>
      {mode === "preview" ? (
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-lg font-semibold">Styled Card Component</p>
            <p className="text-muted text-sm">
              This is a preview of the rendered component. Toggle to Code to see
              the source.
            </p>
            <div className="bg-surface-hover inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm">
              <span className="text-success">●</span> Live preview
            </div>
          </div>
        </Card>
      ) : (
        <pre className="bg-surface-hover overflow-x-auto rounded-md p-4 font-mono text-sm">
          {codeString}
        </pre>
      )}
    </div>
  );
}
