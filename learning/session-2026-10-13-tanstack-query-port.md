# Session — 2026-10-13 — LessonsPage tests, then lesson mutations on TanStack Query

Previous: 2026-10-12, lesson mutations and loader ownership.

## Goal

**Works:** `/lessons` reads through `useSuspenseQuery`; create / rename / delete go through
`useMutation` + `invalidateQueries`; the loader warms the cache so navigation doesn't regress; the
`LessonsPage` tests pass unchanged.

**Can explain:** what a query key is and why invalidating by key beats `router.invalidate()`; why the
loader and the component both read the cache instead of the loader passing data down.

Works: met, with all three operations checked in the browser, 7/7 tests passing and tsc clean.
Explain: half met. The second half came back right. The first half got the scoping right but used an
example that prefix matching contradicts (see Shaky).

## Recall quiz — 3 clean, 2 partial

| Question | Result |
|---|---|
| `res.json()` without `return`, then `res.status(404).json()` | **partial**: said the client gets no lessons. It gets them, with a 200. The second call throws `ERR_HTTP_HEADERS_SENT` server-side only |
| Mechanism of `sort(() => Math.random() - 0.5)` bias | **partial**: "values aren't compared to each other". Missing: 2^k paths can't divide evenly into n! |
| Unawaited `router.invalidate()` in a mutation handler | clean |
| `useState` setter with a partial object vs class `setState` | clean |
| What breaks if `useAuth` is called in two components without context | clean |

Same pattern as 2026-10-12: the rule survives and the mechanism fades. Both partials were the same two
questions as last time, now **two sessions running**.

## Covered

### Practice task: `LessonsPage.test.tsx` (4 tests)

- **Last session's log was wrong:** "no router needed" for `LessonsPage`. `<Link>` reads router
  context and crashes without a `RouterProvider`. The props decision removed `useRouter`, not the
  router dependency.
- Chose a real router in tests (`createRootRoute` + `createRouter` + `createMemoryHistory`) over
  mocking `Link`, so the real `href` can be asserted. Cost: rendering is async, so start each test with
  `await screen.findBy…`.
- `renderPage()` helper returns fresh `vi.fn` spies plus `userEvent.setup()`.
- Targeting one row out of several: `within(element)` scopes queries; `link.closest("li")!` finds the
  row. `!` chosen over an explicit guard: test failures are loud anyway.
- `user-event` over `fireEvent`: real keystrokes, which is the path the rename bug broke. `user.clear`
  before `user.type`, because type appends.
- **Test the component's contract, not the parent's.** The first draft of test 2 expected the name to
  change on screen. The page only calls `onRename`; making the rename real is the route's job. Assert
  `toHaveBeenCalledExactlyOnceWith("Clothes", "c2")`. Plain `toHaveBeenCalledWith` passes if *any*
  call matched.
- **Vacuous assertions:** `expect(findByText(...))` with no matcher and no `await` asserts nothing.
  Straight `"` vs the rendered `“ ”` made `queryByText(...)` always `null`, so
  `.not.toBeInTheDocument()` always passed.
- `getBy` for presence (it throws with the DOM printed), `queryBy` for absence only, `findBy` only
  when something actually arrives later.
- **Red checks done for tests 2–4.** Reverting `onChange` to `startRename` made test 2 receive
  `("Food", "c2")`. Disabling `startDelete` failed test 3 on its assertion and test 4 on finding Cancel,
  an implicit setup assertion with a useful message.

### TanStack Query port

- Router cache is keyed by **route match**; Query's cache is keyed by **data**. Keys are arrays and
  invalidation **prefix-matches**. Java analogue: `@CacheEvict` by key prefix vs `allEntries = true`.
- `QueryClient` reaches loaders through **router context**: `createRootRouteWithContext<{ queryClient }>()(…)`,
  with `context: { queryClient }` in `createRouter`. Reason: testability, so each test gets a fresh
  client. Constructor injection vs a static field. (The circular import is real but incidental.)
- **`ensureQueryData` is deprecated in the installed 5.104.2.** The replacement is
  `queryClient.query({ ...opts, staleTime: "static" })`. The user caught this, not Claude. `"static"`
  means the loader returns cached data without blocking. Without it, the default `staleTime: 0` blocks
  every navigation on a fetch.
- `queryOptions()` in `src/queries.ts` is the single definition of key + fn, shared by the loader
  and the component. If the key drifts, the loader warms one entry and the component reads another,
  with no error.
- `useQuery` returns a result object; `data` is `T | undefined` because the hook can't know a loader
  exists. `data ?? []` is the trap, because it renders "No lessons yet" to someone with lessons.
  `useSuspenseQuery` types `data` as `T`.
- One request on load, not two: `useSuspenseQuery` raises `staleTime` to ≥1000 ms
  (`MIN_SUSPENSE_TIME_MS` in `suspense.js`), so no refetch right after the loader.
- `useLoaderData()` is a snapshot. `invalidateQueries` only refetches queries with an **active
  observer**, and `useSuspenseQuery` is that subscription.
- `useMutation`: `mutationFn` takes one argument, so rename takes `{ name, collectionId }`.
  `onSuccess` **returns** the `invalidateQueries` promise (no braces), which keeps the mutation pending
  until the refetch lands. Pass `mutateAsync` (not `mutate`) so the page's `await` + `try/catch` work
  unchanged.
- `Promise<Collection>` isn't assignable to `Promise<void>`. Widened the page props to
  `Promise<unknown>` because the page only waits and never uses the value.
- **Cache outlives logout, so it leaks user A's lessons to user B** in the same tab, via the `"static"`
  loader. Fixed with `queryClient.clear()` in `useAuth.handleLogout`, the one path every logout goes
  through. Hooks at the top level, handlers use the captured client.

## What landed

- Real router over mocking Link, with a reason.
- "The page's responsibility is calling `onRename`", reached once the failing test was traced.
- Choosing `Promise<unknown>` on the page side, reasoned from what the page uses.
- Predicting what the broken rename sent: `("Food", "c2")`.
- Checking the installed `.d.ts` and catching the `ensureQueryData` deprecation.
- Seeing the cross-user leak immediately, and putting the fix in `handleLogout`.

## Shaky

- **Prefix matching.** The explain-back said invalidating the collections list wouldn't touch word
  lists. Under the planned `["collections", id, "words"]` hierarchy it would. Key design decides
  invalidation scope.
- **Result objects vs values.** Hit twice: passed the `useQuery` result and then the `useMutation`
  result where data or a function was expected. Read the type error's first line: it says what you
  passed.
- **Vacuous assertions.** No matcher, no `await`, wrong quote characters. The red check exposed all of
  them, so keep doing it.
- **The same two mechanism partials, a second session running:** headers-sent and shuffle bias.
- Wrote root route as `createRootRouteWithContext<…>()` without the second call, despite the warning.
- `npm install` run from the repo root (strays removed).
- Asked for code shape at most steps. Fine for new APIs, but watch it on steps that reuse something
  already built (e.g. `queries.ts` was the loader's own object).

## Open questions

- **Key hierarchy for words**: nested `["collections", id, "words"]` + `exact: true` on list
  invalidations, or flat `["words", collectionId]`? Decide at the start of the next increment.
- A 401 from an expired token doesn't go through `handleLogout`, so the cache isn't cleared and the
  user isn't redirected. No global 401 handling yet.
- `isSubmitting` still page-global; `wordsDeleted` still discarded by `api.ts`; `renderRow` can still
  see create-form state (from 2026-10-12, untouched).
- `$collectionId` route still uses the plain loader + `useLoaderData`, so it doesn't share the cache.
- Still no route-level tests, no `supertest`.

## Practice task

Before the reading.

**A route-level test for `LessonsRoute`.** This is the test the context decision was for:

- `vi.mock("../../api")` (or wherever) so `getCollections` / `createCollection` are spies with
  controlled return values.
- Build the real route tree (or the lessons route under a root with context) with a **fresh
  `QueryClient`** passed in router context, and wrap it in `QueryClientProvider` with the same client.
- Test: initial list renders from `getCollections`; create "Clothes" (the mock now returns it), and
  the new row appears **without** a reload, proving the invalidation wiring.
- Red check: drop the `return` from `onSuccess` (add braces), and see whether the test can tell. If it
  can't, write down why.
- Use `new QueryClient({ defaultOptions: { queries: { retry: false } } })` in tests, or a failing
  fetch retries three times and the test times out.

## Reading

**Before the next session:**
[TanStack Router: External Data Loading](https://tanstack.com/router/latest/docs/framework/react/guide/external-data-loading).
It's the integration you just built, and it uses `queryClient.query(... staleTime: 'static')`, so it's
current. Read the error-handling part: the detail route's `notFound()` mapping has to survive the port.

**Deeper:** [Effective React Query Keys (TkDodo)](https://tkdodo.eu/blog/effective-react-query-keys).
Key hierarchy and query-key factories, "most generic to most specific". It's the input to the
nested-vs-flat words-key decision. It's from 2021, so check any API calls against v5. The key-design
ideas haven't aged.

## Next session

**Port `/lessons/$collectionId` to Query and add add-word / delete-word.** Decide the words key
hierarchy first. Keep the `ApiError` 404 → `notFound()` mapping working through `queryClient.query`.
Then `supertest`.

Commit today's work first (tests + `user-event`, then the Query port, separately or together).

## Reference updates

For `references/wordquizer.md`:

- **New dependencies:** `@tanstack/react-query` 5.104, `@testing-library/user-event` 14.
- **Data layer:** TanStack Query owns server data. `QueryClient` is in `main.tsx`, provided via
  `QueryClientProvider` and router context (`createRootRouteWithContext`). Loaders call
  `queryClient.query({ ...opts, staleTime: "static" })`; components read with `useSuspenseQuery`.
  Query definitions live in `src/queries.ts`. **`ensureQueryData` is deprecated in this version.**
- Lesson mutations use `useMutation` + `invalidateQueries(collectionsQuery.queryKey)` in
  `LessonsRoute`; `LessonsPage` handler props are `=> Promise<unknown>`.
- `useAuth.handleLogout` calls `queryClient.clear()`. Required, or the cache leaks across users.
- Tests: `LessonsPage.test.tsx` (4) renders through a real memory-history router. Correct the
  earlier claim that `LessonsPage` needs no router.
- Weak spots: no global 401 handling; detail route not yet on Query; no route-level tests.
