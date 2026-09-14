# Session — 2026-09-14 — lessons slice: route loaders, typed API errors

Continues and completes the feature started 2026-09-11. Supersedes
`checkpoint-2026-09-11-lessons-slice.md`, which can now be deleted.

## Goal

**Works:** `/lessons` lists your lessons; each links to `/lessons/$collectionId`, which shows that
lesson's words and its real name. URLs are shareable, F5 stays put, and an unknown / foreign /
malformed id shows a designed not-found page rather than an error or a misleading empty state.

**Can explain:** why route data belongs in a `loader` rather than a `useEffect`, and what a loader
can do that an effect structurally cannot.

Both met. The session then continued past the feature into the backend param fixes and the first
tests in this repo.

## Covered

### Routing

- `loader` + `Route.useLoaderData()` replacing `useState` + `useEffect` + `loading` flag.
- **`loader: getCollections()` vs `loader: () => getCollections()`** — the first *calls* the function
  at module-evaluation time. `routeTree.gen.ts` statically imports every route module at startup, so
  the fetch fires before login, with no token, and 401s. Worse, a promise is a value that settles
  once: after a successful login the same rejected promise is handed to every navigation until a
  full page reload. `router.invalidate()` cannot help.
- `<Link to="/lessons/$collectionId" params={{ collectionId }}>` vs a template literal. `to` is a
  route id checked against the generated tree and `params` is typed to that route — a typo is a
  compile error. Interpolation throws both away.
- Typed routing means the target route must exist before anything can link to it, so the detail
  route was built before the links.
- `notFoundComponent` and `errorComponent` as siblings of `component`. `notFound()` returns a value
  you throw; it's a router signal, not an error.
- Route file (`LessonsRoute`) adapts loader data to props; `components/LessonsPage.tsx` renders.
  The page never touches the router, so it can be tested with a hand-made array and no router
  context. That's the trade against `getRouteApi`, which removes the wrapper but couples the
  component to a route id.

### Async / error handling

- **`try/catch` cannot catch a promise you didn't `await`.** `try/catch` catches stack unwinding; a
  rejection an event-loop turn later isn't on that stack. Hit in three separate shapes this session.
- `Promise.all` for independent calls. Serialise only when the second call needs the first's
  *result* — a validity dependency isn't a data dependency and isn't worth a waterfall.
  `Promise.all` attaches handlers to every promise, so a second rejection after the first is
  handled internally, not unhandled.
- Positional destructuring of `Promise.all` follows argument order, not completion order.
- `ApiError extends Error` carrying `status`; one `throwIfFailed` doing error extraction, and
  `handleResponse<T>` built on top of it as three lines. The no-body helper disappeared because it
  *was* `throwIfFailed`, and the 204 guard disappeared with it — a special case that protects one
  code path often vanishes when you move the path instead of guarding it.
- Narrowing `unknown` from `response.json()`: `typeof x === "object"` → `x !== null` (because
  `typeof null === "object"`) → `"message" in x` → `typeof x.message === "string"`. No casts.
- An empty `catch {}` is a net. Scoped to the `.json()` parse it's correct; with the `throw` moved
  inside it, it swallowed the very error being constructed.
- `erasableSyntaxOnly` bans constructor parameter properties — they emit runtime code.
- Never annotate `Boolean`/`String`/`Number` (wrapper object types) where you mean the primitive.

### Backend / API design

- `[]` for a foreign id conflates "empty lesson" with "not your lesson" — an ambiguity the frontend
  cannot undo. The driver for `GET /api/collection/:collectionId` was **ambiguity, not disclosure**;
  the old `[]` already leaked nothing. 404-over-403 is still the right instinct for its own reasons.
- Keep the `userId` scope in the query (`findOne({ _id, userId })`), not in an `if` afterwards.
- Mongoose `CastError` → 500 was wrong: the server is fine, the client sent nonsense. 500s are what
  you alert on.
- The mapping belongs in the controller, not the global handler — by then you've lost which route
  threw, and `POST /api/word` with a bad body `collectionId` really is a 400. An uncastable id on a
  GET-by-id is 404 because it identifies no resource in any database state.
- The global handler is a `@ControllerAdvice` with a single `@ExceptionHandler(Exception.class)`.
- **`res.json()` does not end the function.** Sending a response is a side effect; without `return`
  the handler sent a 400 then a 500 and threw `ERR_HTTP_HEADERS_SENT` inside the error handler.
- Don't return `error.message` to clients — Mongoose leaks field names, collections, hosts.

### CSS / Tailwind

- `justify-center` + overflow puts content past the *start* edge, where `scrollTop` can't reach it.
  `justify-start`, or `justify-center-safe` (Tailwind 4.1+; project is on 4.3).
- `items-center` is inert without `flex` — in RN every `View` is flex, in CSS a `div` is `block`.

### Testing — Vitest + React Testing Library

- **First tests in this repo, in any layer.** `LessonDetailPage` tested with no mocks, no router and
  no `fetch` — just props. That is the adapter split from earlier in the session cashing out.
- Assert what a user can observe, not how the component is built. Class names, div nesting and
  "`.map` was called" are implementation; visible text and roles are behaviour.
- `getByRole("heading", { name })` over `getByText` — the role query asserts it really is a heading,
  so swapping the `<h1>` for a styled `<div>` fails the test. Verified by actually doing it.
- Query prefixes: `getBy`/`getAllBy` throw when nothing matches, `queryBy`/`queryAllBy` return
  `null`/`[]`. Absence assertions need the `query` variants, or the throw beats the assertion to it.
- The empty-state test asserts both halves — message present *and* `queryAllByRole("listitem")`
  empty. Without the second half, a component rendering both would pass.
- **Test isolation.** With Vitest `globals: false`, RTL's auto-cleanup never installs — it registers
  itself only when a global `afterEach` exists, and silently does nothing otherwise. The DOM
  accumulated across tests and two of three failed because of the first. Fixed with an explicit
  `afterEach(cleanup)` in `setupTests.ts`. A test that passes because of another test is not passing,
  and order-dependent tests usually fail the *other* way — green in a full run, red alone.
- **A test you have never seen fail is not a test.** Both were deliberately broken and confirmed red
  before being trusted.

### Where a test has to sit to catch a bug

- Not "unit vs integration" as categories — the question is whether the **broken seam** falls inside
  or outside the test boundary. The `req.params` regression lives in the agreement between
  `routes/word.ts` and `wordController.ts`; nothing inside either file is wrong, so only a test where
  Express's real routing runs can find it.
- Consequence: Mongoose could be mocked entirely and the test would still catch it. What must be real
  is the thing under suspicion, not everything.

## What landed

- The `loader: getCollections()` timing bug: module-evaluation time, then the settle-once
  consequence, both reasoned out unprompted.
- `throwIfFailed` / `handleResponse<T>` decomposition, once the two-jobs framing was given.
- The `unknown` narrowing chain, written correctly first time.
- 404-over-403 as a disclosure principle — right principle, wrong application here.
- Choosing the backend fix for `banana` with the correct argument.
- Diagnosing the `errorComponent` gap by testing rather than reasoning.
- Reasoning out unprompted that a component test could not have caught the `req.params` regression,
  and that it needs a test hitting the real endpoint.
- Choosing `string | null` over a helper that sends its own 404, once the trade was laid out.
- All three component tests written correctly first time, including the two-part empty-state
  assertion. Both failures in that file were environment, not test logic.

## Shaky

- **`await` and `try/catch`.** Three separate instances: `handleResponse` called unawaited in
  fourteen functions, `throwIfFailed` unawaited in `deleteCollection` only, the loader's try/catch
  around two unawaited calls. The rule is understood; the habit isn't there.
- **Missing `return` after `res.json()`** and the same shape inside the try block (`return` where a
  fall-through to `throw` was wanted). Three times, three shapes.
- **Parallel vs sequential loading** — first instinct was to serialise to save a request on the
  error path. The rule to keep: serialise only on a *data* dependency.
- **Loader vs effect, the parts not reached unprompted:** nested-route waterfalls, loader data
  outliving the component (and `router.invalidate()`), and the race condition an effect fetch has
  built in without an `ignore` cleanup flag. All three go in the next recall quiz.
- **Verifying a refactor at every call site.** Extracting `parseObjectIdParam` touched five call
  sites. Two came out with the wrong param name: `updateCollection` kept the pre-existing bug the
  task was meant to fix, and `getWordsByCollection` acquired a *new* one that broke the feature built
  an hour earlier. Neither was caught before moving on — the browser wasn't reloaded after the
  change. The habit to build: after a change to a backend handler, open the page.
- **Bugs getting quieter is a cost.** Both param mismatches previously produced a visibly wrong
  `400 Invalid input`; after the refactor they produced a plausible `404 Collection not found` that
  reads as correct behaviour in a log. Worth weighing whenever a fallback is made more graceful.
- **Biased shuffle** — carried over unanswered from 2026-09-11. Still owed: `sort` requires a
  consistent comparator and does only O(n log n) comparisons, so elements drift near their starting
  index.

## Open questions

- `getRouteApi` vs the adapter-component pattern. Chose the adapter for testability; never wrote
  the `getRouteApi` version to compare.
- No root-level `notFoundComponent` on `__root` for URLs matching no route at all.
- `pendingComponent` never used — the router shows it after 1s by default and no route has one.
- Loader caching: `staleTime` defaults to 0, so every navigation revalidates. Not yet tuned or
  discussed.
- `deleteCollection` and `updateCollection` read `req.params` without narrowing `string | string[]`.
  Same latent problem, not yet fixed.

## The param bugs — found, and fixed

**`updateCollection` had never worked.** The route registers `PUT /:collectionId` but the controller
read `req.params.id`, so the id was always `undefined` and the guard returned 400 on every request.
Rename has been broken in production since it was written. `deleteCollection` read the right param,
which is why delete worked.

Found by reading, while looking for somewhere else entirely. Fixed at the end of the session, along
with a `parseObjectIdParam(id: unknown): string | null` helper in `controllers/utils.ts` now used at
all five id-reading call sites.

**A second one was introduced during that refactor** — `getWordsByCollection` was changed from
`req.params.collectionId` to `req.params.id`, which broke every lesson detail page (404 → the
loader's `notFound()` → "The lesson was not found" on a lesson that exists). Also fixed. All five
call sites were then checked against the route table.

**Why the compiler was no help:** `req.params` is a string dictionary, and TypeScript cannot relate
the route literal `"/collection/:collectionId"` to `req.params.id` — different files, no type
relationship. Compare the frontend the same day, where `<Link to="/lessons/$collectionId"
params={{ collectionId }}>` makes a wrong param name a compile error, because TanStack generates
types from the route tree. Same mistake, same day; one layer catches it and the other structurally
cannot.

## Practice task

Both original practice tasks were done inside the session. New assignment, and it comes before the
reading:

1. **Tests for `LessonsPage`.** Same harness, one new wrinkle: it renders `<Link>`, which needs a
   router in context. Work out what RTL needs to render it — TanStack ships helpers for exactly this
   — and write three: lessons render, the empty state, and each lesson links to the right URL. That
   last one is the first test that would catch a broken route reference.
2. **Break something backend-side and confirm nothing goes red.** Change a `req.params` name again
   and run `vitest`. Everything will still pass. That is the honest measure of what the suite covers
   right now, and it's the motivation for the next session.

## Reading

**Read this one before the next session** —
[TanStack Router: Data Loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading).
You've used `loader` and `useLoaderData`; this covers what you haven't touched — `staleTime` and the
SWR cache, `router.invalidate()`, `pendingComponent` and the 1s threshold, and `loaderDeps`. Read the
caching section closely: your loaders currently refetch on every navigation and you haven't decided
whether that's what you want.

**Deeper, when you want it** —
[React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects), specifically
the data-fetching section at the end. This is the code you *didn't* write today: the `ignore` cleanup
flag, why it's necessary, and the note on why the React team suggests not fetching in effects at all.
Reading it after using loaders makes the argument land much harder than reading it first.

**Short, and directly useful for the practice task** —
[Testing Library: About Queries](https://testing-library.com/docs/queries/about/), especially the
priority list. It ranks every query type by how closely it resembles real use, and explains why
`getByRole` sits at the top and `getByTestId` at the bottom. You arrived at the role-over-text
preference empirically today; this is the reasoning, and it decides most "how do I select this"
questions before you have to ask them.

## Next session

**Route tests with `supertest`** — the gap this session exposed twice. Hit the exported `app` with
real requests so the route table and the controllers have to agree. Decide there whether Mongoose is
mocked or `mongodb-memory-server` runs for real, and note that the seam under test (param names)
doesn't require a database at all.

**Then lesson create / rename / delete** — the mutation side of the slice. Mutations have no
`loader`, so the new question is how route data refreshes after a write: `router.invalidate()` and
the caching model. That's what the Data Loading reading covers, so read it first.

## Reference updates

For `references/wordquizer.md`:

- Lessons slice is **done**: `/lessons` and `/lessons/$collectionId` with parallel loaders, typed
  links, `notFoundComponent` and `errorComponent`.
- **Weak spot resolved:** `web/src/api.ts` no longer discards `response.status`. It has `ApiError`
  (status + message), `throwIfFailed`, and `handleResponse<T>`, and all fourteen functions use them.
  `app/src/api.ts` is unchanged and still throws bare `Error`s — irrelevant, it dies at cutover.
- **New endpoint:** `GET /api/collection/:collectionId` → `Collection` or 404. Returns 404 for an
  uncastable id as well as for one not in the caller's collections.
- **Backend error handler** now maps `CastError` → 400 and returns a generic message on 500 instead
  of `error.message`.
- **Weak spot resolved:** `updateCollection`'s param bug fixed; all five id-reading controllers now
  go through `parseObjectIdParam` in `backend/src/controllers/utils.ts` and return 404 for an
  unusable id.
- **New:** `web/` has a test harness — Vitest + jsdom + React Testing Library + jest-dom, configured
  in `vite.config.ts` with `setupFiles: './src/setupTests.ts'`, `globals: false`, and an explicit
  `afterEach(cleanup)`. `npm test` runs it. One test file:
  `src/components/__test__/LessonDetailPage.test.tsx`, three passing.
- **Weak spot narrowed, not closed:** "no automated tests anywhere" → the backend still has none,
  and `web/` has one component file. Nothing covers routing, loaders, or any endpoint.
- Still true: no backend input validation, no pagination, single global error banner, CORS change
  undeployed, Netlify still serving the Expo export.
