# SocialLoginButtons (widget)

**Source:** [`social_login_buttons.dart`](../../../../../flutter-boilerplate/lib/components/auth/social_login_buttons.dart)
**Used in:** [login screen](../screen.md) — the **only** call site in the whole app (see
[register/screen.md § Known issues](../../register/screen.md#known-issues))
**Web equivalent:** [SocialLoginButtons / SocialLoginButton](../../../../frontend/auth/login/components/social-login-buttons.md)

## Purpose

`SocialLoginButtons` (a `ConsumerWidget`) renders a divider + one `_SocialLoginButton` per provider
(same hardcoded 6: google, github, linkedin, huggingface, twitch, x — inline SVG icons, hardcoded
brand colors, matching web's list exactly). `_SocialLoginButton` is a private `ConsumerStatefulWidget`
owning its own `_loading` state and the full OAuth deep-link round trip.

## Behavior notes — the deep-link handshake, not a BFF hop

Unlike web (browser navigation to a same-origin BFF route that itself proxies to the backend), mobile
opens the backend's OAuth-initiate URL **directly** in the system browser and waits for a custom URI
scheme deep link to come back:

1. Generates a random `state` (32 secure-random bytes, base64url) and registers it in
   `pendingOAuthProvider` ([`lib/lib/oauth_link_handler.dart`](../../../../../flutter-boilerplate/lib/lib/oauth_link_handler.dart) —
   doubled `lib/lib/` is real) along with a `Completer<String>`.
2. `launchUrl($backendUrl/auth/oauth/{provider}?state=...&redirect_uri=flutterboilerplate://oauth/callback,
   mode: externalApplication)` — opens the **backend's own** OAuth-initiate REST endpoint in an
   external browser tab, not an in-app WebView.
3. The provider consents, backend exchanges the code, backend redirects the external browser to
   `flutterboilerplate://oauth/callback?state=...` — the OS hands this to the app via `app_links`.
4. `OAuthLinkHandler._handleUri` checks `pending.state == state` (rejects otherwise — the same
   defense web's callback route applies by comparing against its `oauth_state` cookie) and completes
   the `Completer`.
5. Only **then** does `_handleOAuth` call `oauthActionsProvider.loginWithOAuth(resultState)` — a
   direct GraphQL call. This is safe despite `state` originating client-side: the backend's
   `loginWithOAuth` mutation only ever resolves a profile for a `state` that has already been through
   a real server-to-server provider code exchange (see
   [backend endpoints.md § Log in with OAuth](../../../../backend/identity-access/auth/endpoints.md#log-in-with-oauth)) —
   generating `state` locally is equivalent to the CSRF-token pattern, not a trust boundary by itself.

5-minute timeout on the round trip (`completer.future.timeout(Duration(minutes: 5))`), after which
the pending state is cleared and the flow silently gives up.

## Calls

```
_SocialLoginButton (_handleOAuth)
  → launchUrl(backend /auth/oauth/{provider}?state=...&redirect_uri=flutterboilerplate://oauth/callback)
    (external browser; real provider consent + backend code exchange happen outside the app)
  → OAuthLinkHandler resolves the deep link, validates state
  → oauthActionsProvider.loginWithOAuth(state)          — direct GraphQL, api/client/auth/oauth.dart
    → OAuthLoginServer.call()                            — api/server/auth/oauth.dart
      → backend: GraphQL `loginWithOAuth` mutation
```

- API: [api.md § Shape per file](../../api.md#shape-per-file) → `oauth.dart`
- Backend REST leg (step 2): [Start an OAuth flow](../../../../backend/identity-access/auth/endpoints.md#start-an-oauth-flow)
- Backend GraphQL leg (step 5): [Log in with OAuth](../../../../backend/identity-access/auth/endpoints.md#log-in-with-oauth)

Contrast with the **web** equivalent, which navigates through a same-origin Next.js BFF pair instead
of a native deep link — see
[frontend social-login-buttons.md § Calls](../../../../frontend/auth/login/components/social-login-buttons.md#calls)
for that path.
