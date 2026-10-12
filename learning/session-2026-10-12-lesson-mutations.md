# Session — 2026-10-12 — lesson mutations and loader ownership

First session in four weeks. Previous: 2026-09-14, lessons slice.

## Goal

**Works:** create, rename and delete a lesson from `/lessons`, with the list correct afterwards and
no page reload.

**Can explain:** why a mutation needs an explicit cache invalidation when a loader owns the data,
and what `router.invalidate()` actually does.

Both met.

## Recall quiz — 4 of 6

| Question | Result |
|---|---|
| Biased shuffle mechanism | **partial** — "inconsistent comparator" and the drift, but invented an ordering story ("higher ones stay right") that doesn't exist |
| Why an unawaited promise escapes `try/catch` | clean |
| Nested-route waterfall: how many round trips, and why | clean — 2, child can't mount before the parent's data lands |
| Express handler missing `return` after `res.json()` | **partial** — spotted the missing `return`, predicted two responses rather than `ERR_HTTP_HEADERS_SENT` |
| Why TS can't catch `req.params.id` vs a route's `:collectionId` | clean |
| What was wrong with `[]` for a foreign lesson | clean |

The two partials share a shape: the **rule** survived four weeks, the **mechanism** underneath it
didn't. Both go back on the next quiz.

## Covered

### Ownership — who holds server data

- A grep found that **nothing consumed** `words`, `collections` or the five data handlers in
  `WordAppContext`. `LoginPage` used `handleLogin`/`handleRegister`; `_authed/index.tsx` used `email`
  and `handleLogout`. Both hooks ran a `useEffect` fetch on mount, so every page load fired two
  requests for data no component read.
- So "reconcile loaders vs context" was a deletion, not a refactor. `useCollections.ts` and
  `useWords.ts` are gone; context is `token`, `email`, and the three auth handlers.
- **When a context earns its keep:** `useAuth` holds `useState`. Called in two components it would
  be two independent states that never agree. The context exists to make the hook a *single
  instance*, not to be an abstraction layer. Test: does anything break if two components call the
  hook separately?
- Option C (TanStack Query) was chosen first, then reconsidered: doing A first means Query lands on
  pain that has actually been felt. Deferred to next session deliberately.

### `router.invalidate()`

- The router caches loader results **per route match**, populated when a navigation runs a loader.
  `createCollection()` is an ordinary `fetch` in a click handler — there is no mechanism connecting
  it to that cache. **The router only observes navigations, not fetches.** `invalidate()` supplies
  the missing fact: mark matched routes stale, re-run their loaders.
- It returns a promise. `await router.invalidate()` resolves once the loaders have finished, which
  is what lets a handler's own promise mean "the screen behind this is now correct".
- Both `await`s in a handler are load-bearing: missing the first invalidates before the POST lands
  and refetches the old list; missing the second makes the returned promise meaningless.
- Contrast with the old `setCollections(prev => [...prev, newCollection])`: that is a local
  re-implementation of what the server did, and it drifts the moment the server sorts, trims,
  derives a field or rejects a duplicate. Invalidation refetches truth; the cost is a round trip.
- This is exactly what TanStack Query productises — mutations and queries share a client, so
  invalidation is expressed against query keys and can be *scoped*. `router.invalidate()` is
  all-or-nothing across matched routes.

### Component design

- Mutations need the router; `LessonsPage` was deliberately router-free so its tests need no mocks.
  Resolved by keeping the page pure and passing `onCreate`/`onRename`/`onDelete` down as props from
  `LessonsRoute`. Same adapter pattern as the detail route.
- Handler props typed `=> Promise<void>`, not `=> void`, so the page can `await onCreate(name)`
  before closing its form. Typed as `void` the form closes mid-refetch and the old value flashes.
- **No `try/catch` in the route's handlers.** "Do the thing and refresh" is the handler's job;
  deciding what the user sees on failure is a UI decision, so `LessonsPage` catches and renders the
  message next to the control that caused it.
- **One state for row mode**, not two nullable ids: `{ id, mode: "rename" | "confirmDelete" } | null`
  makes the modes mutually exclusive by construction. Two separate `useState`s can both be set, and
  the first branch of the ternary silently wins.
- `renderRow(item)` as a plain function with early returns, called not rendered — it reads enclosing
  scope with no props to thread. The id comparison happens once; the branches read as three cases.
  `key` stays on the `<li>` in `map`.

### Forms

- Use a real `<form onSubmit>`, not an input plus an `onClick` button: Enter submits, mobile
  keyboards show a Go action, `<label htmlFor>` associates properly, `required` guards natively.
- `e.preventDefault()` or the browser navigates and reloads the SPA. **TypeScript cannot catch its
  absence** — `() => Promise<void>` is assignable to a handler expecting `(e: FormEvent) => void`,
  because a function may ignore parameters.
- **A `<button>` in a form defaults to `type="submit"`.** Cancel needs `type="button"` or it submits
  the form it is meant to abandon.
- Clear state *after* the `await`, *inside* the `try`. On failure the form stays open with the text
  intact, so retry is one click.
- `isSubmitting` reset belongs in `finally` — set in `try` only, a failure leaves the button disabled
  permanently and the user cannot retry at all.
- Disable **Cancel** during a delete too: the request can't be recalled, and a live Cancel lets
  someone dismiss the panel and then watch the row vanish anyway.
- Label the in-flight state ("Deleting…"). `disabled` alone reads as broken rather than busy.

### Destructive actions

- `DELETE /api/collection/:collectionId` cascades — every word in the lesson, irreversibly, with no
  undo anywhere in the app. An unguarded button next to Rename is a data-loss bug waiting to be
  filed.
- Chose an inline two-step confirm over `window.confirm`: testable without stubbing, consistent with
  the app, and the question can name the lesson. "Are you sure?" gives the user nothing to check
  against — if they opened the wrong row, the name is what tells them.
- The destructive option should look destructive and should not be the easiest thing to hit.

## What landed

- The ownership argument, once the grep showed the hooks were dead.
- Choosing props-over-`useRouter` for `LessonsPage` with testability as the stated reason, unprompted.
- One state for row mode, after seeing the three-branch ternary.
- The form instinct — asked whether to use `<form>` rather than being told.
- "The router only sees navigations, not fetches" — reached on the second ask, and it's the crux.

## Shaky

- **Browser-checking after a change.** Rename shipped completely unusable: the input's `onChange`
  called `startRename` (resetting the text on every keystroke) and the submit sent `name` — the
  *create* form's state — instead of `editName`. One character typed would have exposed both. Same
  note as the September regression.
- **Mechanisms fading while rules survive** — see the quiz table. Worth deliberately re-deriving a
  mechanism rather than re-reading the rule.
- **`useState` setters replace rather than merge** — needed explaining before `setRowMode` made
  sense. Worth contrasting with a reducer, and with class `setState`, which *did* merge.
- Leftovers suggesting the forms were written by copy rather than by reading: `setName("")` left
  inside `submitRename`, `setRowMode(null)` missing from two handlers, create's Cancel not closing
  the form, `"delte"`.

## Open questions

- `isSubmitting` is one flag shared by the create form and every row, so any mutation disables the
  controls on all the others. Defensible as "one mutation at a time" — but inherited, not decided.
- `deleteCollection` in `api.ts` is typed `Promise<void>` and discards the `{ message, wordsDeleted }`
  the endpoint returns. "Deleted Greetings and 14 words" is sitting there unused.
- `renderRow` reads create-form state it has no business seeing — which is what let `name` be
  submitted instead of `editName`. Promoting it to a `<LessonRow />` with its own local `editName`
  would make that mistake impossible rather than merely fixed.
- Still no root `notFoundComponent`, no `pendingComponent`, `staleTime` untuned.
- `supertest` route tests, deferred twice now.

## Practice task

Before the reading.

**Tests for `LessonsPage`.** It now takes three handler props, so they're spies — `vi.fn()` — and no
router is needed, which was the whole point of the props decision. Cover:

1. clicking Rename on a row shows an input seeded with that lesson's current name
2. typing and submitting calls `onRename` with the new name and that lesson's id
3. clicking Delete shows a confirmation naming the lesson, and `onDelete` is **not** called
4. clicking Cancel in the confirmation calls nothing and restores the normal row

Test 2 is the one that matters: it's the `editName`/`name` bug, and it would have failed. Write it
and confirm it fails against the old code before trusting it.

## Reading

**Before the next session** —
[TanStack Query: Invalidations from Mutations](https://tanstack.com/query/v5/docs/framework/react/guides/invalidations-from-mutations).
Next session ports this feature onto Query, and you've now done the manual version of exactly what
this page automates. Read it as a comparison: note that invalidation is scoped by query key rather
than all-or-nothing, that keys prefix-match, and that returning the promise from `onSuccess` keeps
the mutation pending until the refetch lands — the same reason both `await`s mattered today.

**Short and directly remedial** —
[React: `<input>`](https://react.dev/reference/react-dom/components/input), particularly the
troubleshooting section at the bottom. "My text input doesn't update when I type into it" describes
today's rename bug precisely, including the case where `onChange` fires but doesn't set state from
`e.target.value`. The controlled/uncontrolled distinction is behind two separate bugs this session.

## Next session

**Port the lesson mutations to TanStack Query.** The same four operations, rewritten on
`useQuery`/`useMutation` with `queryClient.invalidateQueries`, plus the router integration (the
loader calls `ensureQueryData` so the router still coordinates). The value is the comparison: you
can state what `router.invalidate()` could not do before you adopt the thing that can.

Then `supertest`, then add-word / delete-word on the detail route.

## Reference updates

For `references/wordquizer.md`:

- **Resolved: the two-sources-of-truth mark.** `useCollections.ts` and `useWords.ts` deleted;
  `WordAppContext` is auth only (`token`, `email`, `handleLogin`, `handleRegister`, `handleLogout`).
  `loading`/`error` gone — errors are now local to the component that caused them.
- **Lesson create / rename / delete done** in `web/`, via `api.ts` + `await router.invalidate()` in
  `LessonsRoute`, with handlers passed to `LessonsPage` as props.
- Add a *Mutations* section: the two-`await` handler shape, errors owned by the UI layer, row-mode
  as one state, and the cascade-delete confirmation requirement.
- **New weak spot:** `isSubmitting` is global to the page; `wordsDeleted` is discarded by
  `api.ts`; `renderRow` can see create-form state.
- Still true: one component test file and no backend tests; no backend input validation; no
  pagination; CORS change undeployed; Netlify still serving the Expo export.
