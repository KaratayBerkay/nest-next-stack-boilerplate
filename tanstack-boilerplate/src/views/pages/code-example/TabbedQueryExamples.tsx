"use client";

import { useState } from "react";
import { IconArrowUpRight } from "@tabler/icons-react";
import { CodeBlock } from "@/views/ui/_shared/CodeBlock";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCodeExampleMessages } from "@/types/pages/code-example/CodeExampleMessages-types";

interface QuerySnippet {
  value: string;
  labelKey: string;
  filename: string;
  code: string;
}

const QUERY_SNIPPETS: QuerySnippet[] = [
  {
    value: "javascript",
    labelKey: "codeExample1JavascriptLabel",
    filename: "utils.js",
    code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};`,
  },
  {
    value: "python",
    labelKey: "codeExample1PythonLabel",
    filename: "utils.py",
    code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

def debounce(func, delay):
    import threading
    timer = None
    def wrapper(*args, **kwargs):
        nonlocal timer
        if timer:
            timer.cancel()
        timer = threading.Timer(delay, func, args, kwargs)
        timer.start()
    return wrapper

def memoize(func):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper`,
  },
  {
    value: "go",
    labelKey: "codeExample1GoLabel",
    filename: "utils.go",
    code: `package utils

func Fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return Fibonacci(n-1) + Fibonacci(n-2)
}

func Map[T, U any](slice []T, transform func(T) U) []U {
    result := make([]U, len(slice))
    for i, item := range slice {
        result[i] = transform(item)
    }
    return result
}`,
  },
  {
    value: "ruby",
    labelKey: "codeExample1RubyLabel",
    filename: "utils.rb",
    code: `def fibonacci(n)
  return n if n <= 1
  fibonacci(n - 1) + fibonacci(n - 2)
end

def debounce(delay, &block)
  @timer&.cancel
  @timer = Thread.new do
    sleep(delay)
    block.call
  end
end

def memoize(method_name)
  cache = {}
  define_method(method_name) do |*args|
    cache[args] ||= super(*args)
  end
end`,
  },
];

export function TabbedQueryExamples() {
  const t = useMessages("pages") as unknown as PagesWithCodeExampleMessages;
  const co = t.codeExample;
  const [selectedLanguage, setSelectedLanguage] = useState(
    QUERY_SNIPPETS[0].value,
  );
  const activeSnippet =
    QUERY_SNIPPETS.find((snippet) => snippet.value === selectedLanguage) ??
    QUERY_SNIPPETS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="grid place-items-center gap-10 lg:grid-cols-2 lg:gap-0">
          <div className="flex flex-col gap-6 lg:pr-20">
            <span className="text-muted text-lg">
              {co["codeExample1Tagline"]}
            </span>
            <h2 className="text-fg text-4xl font-bold tracking-tight md:text-5xl">
              {co["codeExample1Heading"]}
              <br />
              <span className="text-muted">
                {co["codeExample1HeadingHighlight"]}
              </span>
            </h2>
            <p className="text-muted md:text-lg">
              {co["codeExample1Description"]}
            </p>
            <Button
              size="lg"
              className="w-fit"
              rightIcon={<IconArrowUpRight className="h-4 w-4" />}
            >
              {co["codeExample1ButtonLabel"]}
            </Button>
          </div>
          <div className="flex w-full flex-col gap-1 overflow-hidden">
            <Tabs
              defaultValue={QUERY_SNIPPETS[0].value}
              onValueChange={setSelectedLanguage}
            >
              <TabsList className="h-10 w-full">
                {QUERY_SNIPPETS.map((snippet) => (
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
    </section>
  );
}
