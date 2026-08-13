"use client";

import {
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import {
  IconBrandGithub,
  IconBrandGolang,
  IconBrandNodejs,
  IconBrandPython,
  IconBrandRust,
  IconCheck,
  IconCopy,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button, IconButton } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCodeExampleMessages } from "@/types/pages/code-example/CodeExampleMessages-types";

interface CodeExample11Framework {
  id: string;
  labelKey: string;
  filename: string;
  code: string;
}

interface CodeExample11Language {
  id: string;
  nameKey: string;
  icon: ReactNode;
  frameworks: CodeExample11Framework[];
}

const CODE_EXAMPLE_11_LANGUAGES: CodeExample11Language[] = [
  {
    id: "node",
    nameKey: "codeExample11LanguageNode",
    icon: <IconBrandNodejs size={20} />,
    frameworks: [
      {
        id: "prisma",
        labelKey: "codeExample11FrameworkPrisma",
        filename: "prisma/schema.prisma",
        code: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
}`,
      },
      {
        id: "node-pg",
        labelKey: "codeExample11FrameworkNodePostgres",
        filename: "src/db.ts",
        code: `import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const result = await pool.query(
  "SELECT * FROM users WHERE email = $1",
  ["ada@example.com"],
);

console.log(result.rows);`,
      },
    ],
  },
  {
    id: "python",
    nameKey: "codeExample11LanguagePython",
    icon: <IconBrandPython size={20} />,
    frameworks: [
      {
        id: "psycopg",
        labelKey: "codeExample11FrameworkPsycopg",
        filename: "src/db.py",
        code: `import psycopg

conn = psycopg.connect("postgresql://localhost/app")
cur = conn.cursor()
cur.execute(
    "SELECT * FROM users WHERE email = %s",
    ("ada@example.com",),
)
rows = cur.fetchall()
conn.close()`,
      },
      {
        id: "asyncpg",
        labelKey: "codeExample11FrameworkAsyncpg",
        filename: "src/db_async.py",
        code: `import asyncio
import asyncpg


async def main():
    conn = await asyncpg.connect("postgresql://localhost/app")
    rows = await conn.fetch(
        "SELECT * FROM users WHERE email = $1",
        "ada@example.com",
    )
    await conn.close()


asyncio.run(main())`,
      },
    ],
  },
  {
    id: "go",
    nameKey: "codeExample11LanguageGo",
    icon: <IconBrandGolang size={20} />,
    frameworks: [
      {
        id: "go-sql",
        labelKey: "codeExample11FrameworkGoSql",
        filename: "db.go",
        code: `package main

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

func main() {
	db, _ := sql.Open("postgres", "postgres://localhost/app?sslmode=disable")
	defer db.Close()

	rows, _ := db.Query("SELECT * FROM users WHERE email = $1", "ada@example.com")
	fmt.Println(rows)
}`,
      },
      {
        id: "pgx",
        labelKey: "codeExample11FrameworkPgx",
        filename: "db_pool.go",
        code: `package main

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	ctx := context.Background()
	pool, _ := pgxpool.New(ctx, "postgres://localhost/app")
	defer pool.Close()

	rows, _ := pool.Query(ctx, "SELECT * FROM users WHERE email = $1", "ada@example.com")
	fmt.Println(rows)
}`,
      },
    ],
  },
  {
    id: "rust",
    nameKey: "codeExample11LanguageRust",
    icon: <IconBrandRust size={20} />,
    frameworks: [
      {
        id: "sqlx",
        labelKey: "codeExample11FrameworkSqlx",
        filename: "src/main.rs",
        code: `use sqlx::postgres::{PgPool, PgPoolOptions};

#[tokio::main]
async fn main() -> Result<(), sqlx::Error> {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect("postgres://localhost/app")
        .await?;

    let rows = sqlx::query("SELECT * FROM users WHERE email = $1")
        .bind("ada@example.com")
        .fetch_all(&pool)
        .await?;

    println!("{:?}", rows);
    Ok(())
}`,
      },
      {
        id: "tokio-postgres",
        labelKey: "codeExample11FrameworkTokioPostgres",
        filename: "src/db.rs",
        code: `use tokio_postgres::NoTls;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let (client, connection) =
        tokio_postgres::connect("postgres://localhost/app", NoTls).await?;

    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });

    let rows = client
        .query("SELECT * FROM users WHERE email = $1", &[&"ada@example.com"])
        .await?;

    println!("{:?}", rows);
    Ok(())
}`,
      },
    ],
  },
];

function handleLanguageChange(
  languageId: string,
  setLanguageId: Dispatch<SetStateAction<string>>,
  setFrameworkId: Dispatch<SetStateAction<string>>,
) {
  setLanguageId(languageId);
  const language = CODE_EXAMPLE_11_LANGUAGES.find((l) => l.id === languageId);
  setFrameworkId(language?.frameworks[0]?.id ?? "");
}

function handleCopy(
  code: string,
  setCopied: Dispatch<SetStateAction<boolean>>,
) {
  navigator.clipboard.writeText(code);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}

export function DatabaseExamplesStack() {
  const m = useMessages("pages") as unknown as PagesWithCodeExampleMessages;
  const co = m.codeExample;
  const [languageId, setLanguageId] = useState("node");
  const [frameworkId, setFrameworkId] = useState("prisma");
  const [copied, setCopied] = useState(false);

  const activeLanguage =
    CODE_EXAMPLE_11_LANGUAGES.find((language) => language.id === languageId) ??
    CODE_EXAMPLE_11_LANGUAGES[0];
  const activeFramework =
    activeLanguage.frameworks.find(
      (framework) => framework.id === frameworkId,
    ) ?? activeLanguage.frameworks[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {co["codeExample11Title"]}
          </h2>
          <p className="text-muted text-lg">{co["codeExample11Description"]}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {CODE_EXAMPLE_11_LANGUAGES.map((language) => (
            <button
              key={language.id}
              type="button"
              onClick={() =>
                handleLanguageChange(language.id, setLanguageId, setFrameworkId)
              }
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors",
                languageId === language.id
                  ? "border-brand bg-surface-hover"
                  : "border-border bg-surface hover:bg-surface-hover",
              )}
            >
              <span className="border-border bg-surface flex size-9 items-center justify-center rounded-lg border">
                {language.icon}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  languageId === language.id ? "text-fg" : "text-muted",
                )}
              >
                {co[language.nameKey]}
              </span>
            </button>
          ))}
        </div>
        <div className="hidden md:block">
          <Tabs value={frameworkId} onValueChange={setFrameworkId}>
            <TabsList>
              {activeLanguage.frameworks.map((framework) => (
                <TabsTrigger
                  key={framework.id}
                  value={framework.id}
                  className="text-sm"
                >
                  {co[framework.labelKey]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="w-full md:hidden">
          <Select
            value={frameworkId}
            onValueChange={setFrameworkId}
            name="code-example-11-framework"
          >
            <SelectTrigger className="w-full">
              {co[activeFramework.labelKey]}
            </SelectTrigger>
            <SelectContent>
              {activeLanguage.frameworks.map((framework) => (
                <SelectItem key={framework.id} value={framework.id}>
                  {co[framework.labelKey]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="border-border bg-surface w-full overflow-hidden rounded-2xl border">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <span className="text-muted font-mono text-xs">
              {activeFramework.filename}
            </span>
            <IconButton
              icon={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              variant="ghost"
              size="icon-xs"
              label={
                copied
                  ? co["codeExample11CopiedLabel"]
                  : co["codeExample11CopyLabel"]
              }
              onClick={() => handleCopy(activeFramework.code, setCopied)}
            />
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
            <code>{activeFramework.code}</code>
          </pre>
        </div>
        <div className="flex w-full max-w-md flex-col items-center gap-4">
          <div className="border-border w-full border-t" />
          <Button variant="link" className="gap-2">
            <IconBrandGithub size={16} />
            {co["codeExample11Docs"]}
          </Button>
        </div>
      </div>
    </section>
  );
}
