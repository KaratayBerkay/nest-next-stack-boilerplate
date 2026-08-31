"use client";

import { useState } from "react";
import { IconArrowUpRight } from "@tabler/icons-react";
import { CodeBlock } from "@/views/ui/_shared/CodeBlock";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCodeExampleMessages } from "@/types/pages/code-example/CodeExampleMessages-types";

interface RequestSnippet {
  value: string;
  labelKey: string;
  filename: string;
  code: string;
}

const REQUEST_SNIPPETS: RequestSnippet[] = [
  {
    value: "javascript",
    labelKey: "codeExample2JavascriptLabel",
    filename: "http-request.js",
    code: `// Node.js HTTP request using fetch (Node 18+)
const response = await fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token-here'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com'
  })
});

const data = await response.json();
console.log('Response:', data);

// Alternative using axios
const axios = require('axios');
const response2 = await axios.post('https://api.example.com/data', {
  name: 'John Doe',
  email: 'john@example.com'
}, {
  headers: {
    'Authorization': 'Bearer your-token-here'
  }
});`,
  },
  {
    value: "python",
    labelKey: "codeExample2PythonLabel",
    filename: "http_request.py",
    code: `# Python HTTP request using the requests library
import requests

response = requests.post(
    'https://api.example.com/data',
    json={
        'name': 'John Doe',
        'email': 'john@example.com'
    },
    headers={
        'Authorization': 'Bearer your-token-here'
    }
)

print(f'Status Code: {response.status_code}')
print(f'Response: {response.json()}')

# Alternative using httpx (async)
import httpx
import asyncio

async def make_request():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'https://api.example.com/data',
            json={'name': 'John Doe', 'email': 'john@example.com'},
            headers={'Authorization': 'Bearer your-token-here'}
        )
        return response.json()

# asyncio.run(make_request())`,
  },
  {
    value: "go",
    labelKey: "codeExample2GoLabel",
    filename: "http_request.go",
    code: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

type User struct {
    Name  string \`json:"name"\`
    Email string \`json:"email"\`
}

func main() {
    user := User{
        Name:  "John Doe",
        Email: "john@example.com",
    }

    jsonData, _ := json.Marshal(user)

    req, _ := http.NewRequest("POST", "https://api.example.com/data", bytes.NewBuffer(jsonData))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer your-token-here")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        fmt.Printf("Error: %v\\n", err)
        return
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    fmt.Printf("Status: %s\\n", resp.Status)
    fmt.Printf("Response: %s\\n", string(body))
}`,
  },
];

export function HttpRequestTabs() {
  const t = useMessages("pages") as unknown as PagesWithCodeExampleMessages;
  const co = t.codeExample;
  const [selectedLanguage, setSelectedLanguage] = useState(
    REQUEST_SNIPPETS[0].value,
  );
  const activeSnippet =
    REQUEST_SNIPPETS.find((snippet) => snippet.value === selectedLanguage) ??
    REQUEST_SNIPPETS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="bg-surface border-border relative rounded-3xl border p-6 lg:p-10">
          <div className="border-border bg-surface absolute -top-1 -left-1 size-[7px] rounded-full border" />
          <div className="border-border bg-surface absolute -top-1 -right-1 size-[7px] rounded-full border" />
          <div className="border-border bg-surface absolute -bottom-1 -left-1 size-[7px] rounded-full border" />
          <div className="border-border bg-surface absolute -right-1 -bottom-1 size-[7px] rounded-full border" />
          <div className="grid grid-cols-1 place-items-center gap-12 lg:grid-cols-2 lg:gap-6">
            <div className="relative flex flex-col gap-6">
              <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
                {co["codeExample2Title"]}
              </h2>
              <p className="text-muted lg:text-lg">
                {co["codeExample2Description"]}
              </p>
              <Button
                variant="outline"
                className="w-fit"
                rightIcon={<IconArrowUpRight className="h-4 w-4" />}
              >
                {co["codeExample2DocsButton"]}
              </Button>
            </div>
            <div className="flex w-full flex-col gap-1 overflow-hidden">
              <Tabs
                defaultValue={REQUEST_SNIPPETS[0].value}
                onValueChange={setSelectedLanguage}
              >
                <TabsList className="grid h-10 w-full grid-cols-3">
                  {REQUEST_SNIPPETS.map((snippet) => (
                    <TabsTrigger key={snippet.value} value={snippet.value}>
                      {co[snippet.labelKey]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="border-border bg-surface flex items-center rounded-t-xl border border-b-0 px-4 py-2">
                <span className="text-muted font-mono text-xs">
                  {activeSnippet.filename}
                </span>
              </div>
              <CodeBlock code={activeSnippet.code} className="rounded-t-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
