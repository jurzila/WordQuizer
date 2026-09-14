# Checkpoint — lessons slice — 2026-09-11

Scaffolding, not a session log. Discard once the feature is finished and the log is written.

## Goal (unchanged from session start)

**Works at the end:** `/lessons` lists your lessons. Clicking one navigates to `/lessons/<id>` and
shows that lesson's words. The URL is shareable — pasting it fresh loads that lesson directly, and
F5 stays put. A lesson id that doesn't exist, or belongs to someone else, shows something sensible
rather than crashing or hanging.

**Can explain at the end:** why data loading belongs in a route `loader` rather than a `useEffect`
in the component, and what the router can do with a loader that a `useEffect` structurally cannot.

**Scope — in:** the two routes, their loaders, the list, the links, the not-found case.
**Out:** create / rename / delete lessons. That is the next increment. Adding them mid-session is
scope creep.

## Done so far

**Recall quiz — 3 of 4.** `key` as unmount-plus-remount came back correctly for the first time in
three sessions. `beforeLoad` runs only on navigation — correct. `Navigate` element vs `useNavigate`
in render — correct. The biased shuffle was vague and goes back on the list.

**Route restructure — done.** Guard moved out of the individual route into one pathless layout:

```
routes/
├── __root.tsx
├── login.tsx                    "/login"   — public
├── _authed.tsx                  (no URL)   — beforeLoad guard + <Outlet />
└── _authed/
    ├── index.tsx                "/"        — Home
    └── lessons/
        └── index.tsx            "/lessons" — STUB
```

- `_authed.tsx` — `beforeLoad` reads `TOKEN_KEY` from storage and throws `redirect({ to: "/login" })`;
  component is a bare `<Outlet />`. Correct.
- `_authed/index.tsx` — `Home` moved across, its own `beforeLoad` removed, id now `"/_authed/"`.
  Correct.
- `routes/index.tsx` deleted.
- `routeTree.gen.ts` is regenerating — the dev server is running and the route-id type errors have
  cleared.

There was a near-miss worth remembering: `_authed.tsx` was created but not saved, so for a while the
guard existed nowhere and `/` and `/lessons` were both open. Nothing errored. That is the exact
bug-of-omission the layout route exists to prevent, landing on the *move* rather than on a later
addition.

## In progress

`npx tsc -b --force` has **one** error:

```
src/routes/_authed/lessons/index.tsx(4,72): error TS2304: Cannot find name 'LessonsPage'
```

`_authed/lessons/index.tsx` is a two-line stub — `createFileRoute("/_authed/lessons/")({ component: LessonsPage })`
with no loader, no component defined and no imports.

`_authed/lessons/$collectionId.tsx` does not exist yet.

## Next step

In order:

1. **`LessonsPage` + loader** in `_authed/lessons/index.tsx`:
   ```tsx
   loader: () => getCollections(),
   component: LessonsPage,
   // inside: const collections = Route.useLoaderData()
   ```
   No `useState`, no `useEffect`, no `loading` flag — that is the point of the swap.
2. **Links**, with the param as its own prop, not interpolated:
   ```tsx
   <Link to="/lessons/$collectionId" params={{ collectionId: c._id }}>
   ```
   The path literal is a route id checked against the generated tree, so a typo is a compile error
   and `params` is typed to that route's params. A template literal throws both away.
3. **`_authed/lessons/$collectionId.tsx`** — `loader: ({ params }) => getWordsByCollection(params.collectionId)`,
   component uses `Route.useLoaderData()` and `Route.useParams()`.
4. **Delete the `BASE_URL` fallback** in `api.ts` (`http://192.168.0.110:3000/api`) — carried over
   from last session's practice list, still undone.
5. **Verify the guard**: private window, type `/lessons`, expect `/login`.
6. **Then** handle the unknown / foreign id case — see below.

## Decisions made

- **Guard lives in one pathless layout route**, not copy-pasted per route. The argument that decided
  it: copy-paste fails by *omission* — add `/profile` later without the guard and nothing errors, it
  just serves unprotected. With a layout, nesting is the protection and you cannot forget it.
  Secondary benefit: `_authed.tsx` is where the shared shell (nav, logout) goes later.
- **`loader` over `useEffect`** for route data. An effect cannot run before its component renders, so
  there is always at least one committed paint with no data — and a blank list is indistinguishable
  from an empty lesson. A loader runs during navigation, before the component is created. Mapping
  that stuck: **the loader is the controller, the component is the view**; `useEffect`-fetching is a
  JSP opening its own DB connection.
- Three consequences of that, recorded so they are not relitigated: no serial waterfalls across
  nested routes; loader data outlives the component so back-navigation does not refetch; pending and
  error states become the router's job via `pendingComponent` / `errorComponent`.
- **Route ids keep the `_authed` segment** (`"/_authed/lessons/"`) while URLs do not (`/lessons`).
  The plugin rewrites these — never hand-edit `routeTree.gen.ts`.
- **No new API functions needed.** `getCollections()` and `getWordsByCollection(collectionId)` already
  exist in `web/src/api.ts`.

## Stuck on / unresolved

- **Foreign / unknown `collectionId` is ambiguous.** The backend scopes every query by `userId`, so
  `getWordsByCollection("someone-elses-id")` returns `[]` rather than 403. A foreign lesson and a
  genuinely empty lesson are byte-identical responses. Deliberately left until the routes work.
  Options to weigh then: have the loader also fetch the collection and `throw notFound()` when it
  isn't in the user's list; or change the backend to 404. Not yet discussed.
- **`ApiError` carrying `status`** — agreed out of migration scope, still the fix for `api.ts`
  discarding status codes across fourteen functions.
- **Last session's practice items are still undone**: collapse `handleSubmit`'s duplicated branches,
  delete the `BASE_URL` fallback, rename `--color-borderInput` and `--color-text-*`, and verify in
  the browser whether the error message survives a failed-login guard bounce.
- **Biased shuffle** — answered vaguely ("comparing two items between each other"). The mechanism is
  that `sort` requires a consistent comparator and performs only O(n log n) comparisons, so elements
  drift near their starting index. Back in the next quiz.
