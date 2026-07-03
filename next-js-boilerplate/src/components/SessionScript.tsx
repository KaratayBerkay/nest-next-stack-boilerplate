import { getSessionUser } from "@/lib/auth-ssr";

export async function SessionScript() {
  const user = await getSessionUser();
  if (!user) return null;

  const json = JSON.stringify(user)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__INITIAL_USER__ = ${json};`,
      }}
    />
  );
}
