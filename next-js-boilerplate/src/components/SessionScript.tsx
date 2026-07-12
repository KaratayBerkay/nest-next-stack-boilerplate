import { getSessionUser } from "@/lib/auth-ssr";
import { getAccessToken } from "@/store/ssr-cookies";

export async function SessionScript() {
  const user = await getSessionUser();
  if (!user) return null;

  const json = JSON.stringify(user)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  const accessToken = await getAccessToken();
  const tokenJson = accessToken
    ? JSON.stringify(accessToken).replace(/</g, "\\u003c")
    : "null";

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__INITIAL_USER__ = ${json};`,
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__INITIAL_TOKEN__ = ${tokenJson};`,
        }}
      />
    </>
  );
}
