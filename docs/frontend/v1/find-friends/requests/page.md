# Find Friends Requests (page)

**Route:** `/v1/[lang]/find-friends/requests` · **Source:** [`page.tsx`](../../../../../next-js-boilerplate/src/app/v1/[lang]/find-friends/requests/page.tsx)
**Mobile equivalent:** [find-friends/requests screen](../../../../mobile/v1/find-friends/requests/screen.md)
(a genuinely separate screen on mobile — see that doc; this is **not** true on web, see below)

## This is the same page as `/find-friends`, opened with a different default tab

`requests/page.tsx` imports the identical `VIEWS` map
(`FreePageView`/`BasicPageView`/`MediumPageView`/`PremiumPageView` from
`@/views/find-friends/*PageView`) as [`find-friends/page.tsx`](../page.md) — same components, same
tier gating, same data fetching. The only difference in the whole file is the page `<title>` metadata
("Friend Requests" vs. "Find Friends"). See [../README.md § Two routes, one component
tree](../README.md#two-routes-one-component-tree) for the mechanism (a `usePathname()` check inside
the shared content components picks "pending" as the active tab when the path ends `/requests`).

Everything else — components, hooks, API calls, tier behavior, known issues — is documented once, on
[../page.md](../page.md). This file exists only so the doc tree mirrors the real route tree 1:1
(conventions.md §1) and so a reader landing here via a direct link isn't left without a page doc at
all.
