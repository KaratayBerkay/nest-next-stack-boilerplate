"use client";

import { useState } from "react";
import {
  IconApi,
  IconBrandGraphql,
  IconBrandJavascript,
  IconBrandPython,
  IconCode,
  IconPlugConnected,
} from "@tabler/icons-react";
import type { IconProps } from "@tabler/icons-react";
import { CodeBlock } from "@/views/ui/_shared/CodeBlock";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCodeExampleMessages } from "@/types/pages/code-example/CodeExampleMessages-types";

interface ApiLanguage {
  value: string;
  labelKey: string;
  filename: string;
  code: string;
}

interface ApiOption {
  id: string;
  icon: React.ComponentType<IconProps>;
  titleKey: string;
  descriptionKey: string;
  languages: ApiLanguage[];
}

const CODES: Record<string, string> = {
  "api-client.js": `const res = await fetch('https://api.example.com/users', {
  headers: { 'Authorization': 'Bearer your-api-key' },
});
const users = await res.json();
console.log('Users:', users);`,
  "api_client.py": `import requests

response = requests.get(
    'https://api.example.com/users',
    headers={'Authorization': 'Bearer your-api-key'},
)
print(f"Users: {response.json()}")`,
  "api_client.rb": `require 'httparty'

response = HTTParty.get('https://api.example.com/users',
  headers: { 'Authorization' => "Bearer #{ENV['API_KEY']}" })
puts "Users: #{response.parsed_response}"`,
  "graphql-client.js": `const GET_USERS = gql\`
  query GetUsers($limit: Int) {
    users(limit: $limit) { id name email }
  }
\`;
const { data, loading, error } = useQuery(GET_USERS, {
  variables: { limit: 10 },
});`,
  "graphql_client.py": `from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport

client = Client(
    transport=AIOHTTPTransport(url="https://api.example.com/graphql"),
)
GET_USERS = gql("{ users(limit: 10) { id name email } }")
print(client.execute(GET_USERS))`,
  "graphql_client.rb": `require 'graphql/client'
require 'graphql/client/http'

HTTP = GraphQL::Client::HTTP.new("https://api.example.com/graphql")
Client = GraphQL::Client.new(
  schema: GraphQL::Client.load_schema(HTTP),
  execute: HTTP,
)
GET_USERS = Client.parse("{ users(limit: 10) { id name email } }")
puts Client.query(GET_USERS).data.users`,
  "websocket-client.js": `const ws = new WebSocket('wss://api.example.com/ws');

ws.onopen = () => ws.send(JSON.stringify({
  type: 'subscribe', channel: 'notifications',
}));
ws.onmessage = (event) =>
  console.log('Received:', JSON.parse(event.data));`,
  "websocket_client.py": `import asyncio, json, websockets

async def listen():
    async with websockets.connect("wss://api.example.com/ws") as ws:
        await ws.send(json.dumps({"type": "subscribe", "channel": "notifications"}))
        async for message in ws:
            print(f"Received: {json.loads(message)}")

asyncio.run(listen())`,
  "websocket_client.rb": `require 'websocket-client-simple'
require 'json'

ws = WebSocket::Client::Simple.connect('wss://api.example.com/ws')
ws.on :message do |msg|
  puts "Received: #{JSON.parse(msg.data)}"
end
ws.on :open do
  ws.send(JSON.generate({ type: 'subscribe', channel: 'notifications' }))
end
sleep(60)`,
};

const jsL = (filename: string): ApiLanguage => ({
  value: "javascript",
  labelKey: "codeExample5JavascriptLabel",
  filename,
  code: CODES[filename],
});
const pyL = (filename: string): ApiLanguage => ({
  value: "python",
  labelKey: "codeExample5PythonLabel",
  filename,
  code: CODES[filename],
});
const rbL = (filename: string): ApiLanguage => ({
  value: "ruby",
  labelKey: "codeExample5RubyLabel",
  filename,
  code: CODES[filename],
});

const API_SNIPPETS: ApiOption[] = [
  {
    id: "rest",
    icon: IconApi,
    titleKey: "codeExample5RestTitle",
    descriptionKey: "codeExample5RestDescription",
    languages: [
      jsL("api-client.js"),
      pyL("api_client.py"),
      rbL("api_client.rb"),
    ],
  },
  {
    id: "graphql",
    icon: IconBrandGraphql,
    titleKey: "codeExample5GraphqlTitle",
    descriptionKey: "codeExample5GraphqlDescription",
    languages: [
      jsL("graphql-client.js"),
      pyL("graphql_client.py"),
      rbL("graphql_client.rb"),
    ],
  },
  {
    id: "websocket",
    icon: IconPlugConnected,
    titleKey: "codeExample5WebsocketTitle",
    descriptionKey: "codeExample5WebsocketDescription",
    languages: [
      jsL("websocket-client.js"),
      pyL("websocket_client.py"),
      rbL("websocket_client.rb"),
    ],
  },
];

const LANGUAGE_ICONS: Record<string, React.ComponentType<IconProps>> = {
  javascript: IconBrandJavascript,
  python: IconBrandPython,
  ruby: IconCode,
};

export function ApiIntegrationSnippets() {
  const t = useMessages("pages") as unknown as PagesWithCodeExampleMessages;
  const co = t.codeExample;
  const [selectedApi, setSelectedApi] = useState(API_SNIPPETS[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const activeApi =
    API_SNIPPETS.find((api) => api.id === selectedApi) ?? API_SNIPPETS[0];
  const activeLanguage =
    activeApi.languages.find((l) => l.value === selectedLanguage) ??
    activeApi.languages[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-fg mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            {co["codeExample5Title"]}
          </h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="space-y-2">
              {API_SNIPPETS.map((api) => {
                const ApiIcon = api.icon;
                const isActive = api.id === selectedApi;
                return (
                  <button
                    key={api.id}
                    type="button"
                    onClick={() => setSelectedApi(api.id)}
                    className={cn(
                      "w-full cursor-pointer rounded-lg p-4 text-left transition-all",
                      isActive
                        ? "bg-surface ring-border border-border ring-1"
                        : "hover:bg-surface-hover",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-surface-hover rounded-lg p-2">
                        <ApiIcon className="text-brand size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-fg truncate text-sm font-medium">
                          {co[api.titleKey]}
                        </h3>
                        <p className="text-muted line-clamp-2 text-sm">
                          {co[api.descriptionKey]}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="min-w-0 lg:col-span-2">
            <div className="flex w-full flex-col gap-1 overflow-hidden">
              <Tabs
                defaultValue="javascript"
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
              >
                <TabsList className="grid h-10 w-full grid-cols-3">
                  {activeApi.languages.map((l) => {
                    const LangIcon = LANGUAGE_ICONS[l.value];
                    return (
                      <TabsTrigger key={l.value} value={l.value}>
                        {LangIcon && <LangIcon className="size-4" />}
                        <span className="hidden lg:inline">
                          {co[l.labelKey]}
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
              <div className="border-border bg-surface flex items-center rounded-t-xl border border-b-0 px-4 py-2">
                <span className="text-muted font-mono text-xs">
                  {activeLanguage.filename}
                </span>
              </div>
              <CodeBlock
                code={activeLanguage.code}
                className="rounded-t-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
