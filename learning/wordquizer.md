<!-- MAINTENANCE: this file goes stale as the project moves. Update the "Current state"
block below at the end of any session that changed the codebase. The rest of the file is
the durable architecture description and only needs updating on bigger structural changes. -->

# Current state

- **Last updated:** 2026-09-14
- **Working on:** migrating the frontend from Expo/React Native (`app/`) to Vite + React (`web/`).
  The **auth slice** and the **lessons slice** are complete: register, login, logout, a guarded
  route group, `/lessons`, and `/lessons/$collectionId` with route loaders, typed links, and
  not-found handling. Next increment is **lesson create / rename / delete** — the mutation side,
  which brings `router.invalidate()` and the loader cache.
- **Branch:** `feature/migration-to-react`. `web/` committed for the first time on 2026-09-14.
- **Known weak spots:**
  - **Test coverage is one file.** `web/src/components/__test__/LessonDetailPage.test.tsx`, three
    tests. Nothing covers routing, loaders, `api.ts`, or any backend endpoint. The backend has no
    test harness at all — and the two param bugs found on 2026-09-14 were precisely the class that
    only a route-level test catches.
  - No input validation layer on the backend — controllers hand `req.body` straight to Mongoose.
  - No pagination on word lists.
  - **➤ RESOLVE NEXT SESSION — two sources of truth for lesson data.** The lessons routes read from
    route loaders; `WordAppContext` still holds `words`, `collections` and a global `loading`/`error`
    banner that duplicates the route-level `pendingComponent`/`errorComponent`. Nothing currently
    keeps the two in sync, and the create/rename/delete increment writes to data that both claim to
    own — so the first mutation makes the context copy stale on screen. Decide ownership **before**
    writing any mutation code, not during. See "Planned Next Steps" item 2.
  - `backend/src/app.ts` CORS change (comma-separated origin list) is **written but not deployed** —
    needs a merge to `main` and `ALLOWED_ORIGIN` updated in the Render dashboard.
  - Netlify still builds and serves the Expo export. Repointing it is part of cutover.
  - Three cheatsheets still sit in `app/learning/`, which is deleted at cutover.
  - `app/src/api.ts` still throws bare `Error`s. Irrelevant — it dies at cutover — but don't copy
    from it.

---

# WordQuizer — Project Summary

## Overview

WordQuizer is a full-stack word learning application, mobile-browser optimised. Users create
lessons, add word pairs (e.g. Lithuanian → English), and practise with matching quizzes and
flashcards. Deployed, with user authentication.

The project exists partly to build breadth outside Java: TypeScript, React, NoSQL, and frontend
deployment.

---

## Two frontends, mid-migration

| | `app/` — legacy | `web/` — active |
|---|---|---|
| Stack | Expo + React Native (web export via `react-native-web`) | Vite + React |
| Routing | React Navigation (bottom tabs + native stacks) | TanStack Router, file-based |
| Styling | `StyleSheet.create` + `theme/` objects | Tailwind CSS v4 via `@theme` |
| Storage | AsyncStorage (async) | `localStorage` (sync), wrapped in `src/storage.ts` |
| Tests | none | Vitest + React Testing Library |
| Status | complete, deployed, **deleted at cutover** | auth + lessons done, rest to port |

Both talk to the same Express backend. `app/` stays until `web/` reaches parity, then is deleted
outright — the migration is a rewrite beside it, not an in-place conversion.

---

## Tech Stack

### `web/` — the active frontend
- **Vite 8** + **React 19.2** + **TypeScript 6** (`strict: true`, `erasableSyntaxOnly: true`)
- **TanStack Router 1.170** — file-based routing, `@tanstack/router-plugin` codegen
- **Tailwind CSS v4.3** via `@tailwindcss/vite`
- **Vitest 5** + **jsdom** + **React Testing Library 16** + **jest-dom**
- **oxlint** for linting
- `localStorage` for token/email persistence

### `app/` — the legacy frontend
- React Native + Expo, React Navigation, AsyncStorage, RN `Animated` API

### Backend
- **Node.js** + **TypeScript**, **Express 5**
- **Mongoose 9** → **MongoDB Atlas** (free tier)
- **JWT** (`jsonwebtoken`), **bcryptjs**
- `nodemon` for dev
- No test harness

### Deployment
- Frontend → **Netlify** (auto-deploy on merge to `main`) — *still pointing at the Expo build*
- Backend → **Render** (auto-deploy on merge to `main`)
- Database → MongoDB Atlas

---

## Project Structure

```
WordQuizer/
├── web/                          # ACTIVE frontend — Vite + React
│   ├── src/
│   │   ├── main.tsx              # createRouter, Register decl, WordAppProvider > RouterProvider
│   │   ├── index.css             # @import "tailwindcss" + @theme design tokens
│   │   ├── api.ts                # fetch fns + ApiError + throwIfFailed/handleResponse
│   │   ├── storage.ts            # readStored/writeStored/clearStored, try/catch wrapped
│   │   ├── types.ts              # Word, Collection, AuthResponse
│   │   ├── setupTests.ts         # jest-dom matchers + explicit afterEach(cleanup)
│   │   ├── routes/               # file-based routing — filesystem mirrors the URL
│   │   │   ├── __root.tsx        # bare <Outlet />, no shell yet
│   │   │   ├── login.tsx         # "/login"  — public
│   │   │   ├── _authed.tsx       # (no URL)  — beforeLoad guard + <Outlet />
│   │   │   └── _authed/
│   │   │       ├── index.tsx     # "/"
│   │   │       └── lessons/
│   │   │           ├── index.tsx          # "/lessons"
│   │   │           └── $collectionId.tsx  # "/lessons/:id"
│   │   ├── routeTree.gen.ts      # generated by the plugin — COMMITTED (see below)
│   │   ├── components/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── LessonsPage.tsx
│   │   │   ├── LessonDetailPage.tsx
│   │   │   └── __test__/LessonDetailPage.test.tsx
│   │   ├── context/WordAppContext.tsx
│   │   ├── hooks/                # useAuth, useWords, useCollections
│   │   ├── reducers/             # quizReducer, flashcardsReducer (ported, unused so far)
│   │   └── utils/shuffle.ts
│   ├── vite.config.ts            # tanstackRouter() BEFORE react(); tailwindcss(); test block
│   ├── .env.example              # committed; documents VITE_API_URL
│   ├── .env.development          # gitignored
│   └── .env.production           # gitignored
│
├── app/                          # LEGACY frontend — deleted at cutover
│   ├── App.tsx
│   ├── src/{api,types}.ts
│   ├── src/{context,hooks,reducers,navigation,screens,components,theme}/
│   └── learning/                 # 3 cheatsheets still here; move before cutover
│
├── backend/
│   ├── src/
│   │   ├── index.ts              # PORT default 3000
│   │   ├── app.ts                # express + cors + routes + error middleware
│   │   ├── config/db.ts
│   │   ├── models/               # User, Word, Collection
│   │   ├── controllers/          # auth, word, collection, utils.ts
│   │   ├── routes/               # auth, word, collection
│   │   ├── middleware/auth.ts    # JWT verification
│   │   └── types/express.d.ts    # Request.userId augmentation
│   └── .env                      # PORT, MONGODB_URI, JWT_SECRET, ALLOWED_ORIGIN
│
└── learning/                     # session logs + references (survives cutover)
```

**`routeTree.gen.ts` is committed**, not gitignored. It is generated, but a fresh clone cannot run
`tsc -b` or `vitest` before someone has started Vite once — every route import fails. Committing it
costs a generated file in routing diffs and buys a repo that typechecks and tests from cold. Never
hand-edit it.

---

## Data Models

### User
```typescript
{ email: string /* unique, lowercase, trimmed */, password: string /* bcrypt */, timestamps: true }
```

### Collection
```typescript
{ name: string, userId: ObjectId /* ref: User */, timestamps: true }
```

### Word
```typescript
{ word: string, translation: string, collectionId: ObjectId, userId: ObjectId, timestamps: true }
```

### Frontend types
```typescript
export type Word = { _id: string; word: string; translation: string; collectionId: string }
export type Collection = { _id: string; name: string }
export type AuthResponse = { token: string; email: string }
```

---

## API Endpoints

All routes except auth require `Authorization: Bearer <token>`.

```
POST   /api/auth/register              { email, password } → AuthResponse
POST   /api/auth/login                 { email, password } → AuthResponse

GET    /api/collection                 → Collection[]
GET    /api/collection/:collectionId   → Collection | 404
POST   /api/collection                 { name } → Collection
PUT    /api/collection/:collectionId   { name } → Collection
DELETE /api/collection/:collectionId   → { message, wordsDeleted }   // cascade

GET    /api/word                       → Word[]
GET    /api/word/collection/:collectionId → Word[]
POST   /api/word                       { word, translation, collectionId } → Word
DELETE /api/word/:id                   → 204
GET    /api/word/quiz?collectionIds    → Word[] (30 random via $sample)

GET    /health                         → { status: "ok" }
```

All collection and word controllers filter by `userId` from the JWT, **in the query** —
`findOne({ _id, userId })`, never a fetch followed by an ownership `if`. The two behave identically
today and diverge the moment someone adds a projection or `.lean()`.

### Why `GET /api/collection/:collectionId` exists

Before it, the client asked for a lesson's words and got `[]` for both "this lesson is empty" and
"this lesson is not yours" — byte-identical responses for two different facts. No amount of
frontend logic can separate them afterwards. The endpoint was added so the detail route can
distinguish them; it also supplies the lesson name, which the words endpoint never carried.

The driver was **ambiguity, not disclosure** — the old `[]` leaked nothing either. 404-over-403
remains correct for its own reason: a 403 confirms an id exists.

### Id handling

`backend/src/controllers/utils.ts` exports:

```typescript
parseObjectIdParam(id: unknown): string | null
```

Every id-reading controller calls it and 404s on `null`. Two reasons it returns `string | null`
rather than sending its own response: the caller gets TypeScript narrowing for free on the happy
path, and a helper that writes to `res` cannot stop the controller anyway — it would still need a
`return` at the call site, which is exactly the bug it looks like it prevents.

An uncastable id (`/api/collection/banana`) returns **404, not 400**, on GET-by-id routes: a string
that cannot be an `ObjectId` identifies no resource in any database state, so "not found" is simply
true. The `CastError` → 400 mapping in the global handler covers everything else — notably a bad
`collectionId` in a **body**, which really is a malformed request.

### Error middleware

`app.ts`'s final `app.use` is the `@ControllerAdvice` equivalent. It maps `CastError` → 400 and
everything else → 500 with a **generic** message; `error.message` is logged, never returned.
Mongoose errors name fields, collections and hosts.

`res.json()` does not end a handler. Every response that is not the last statement on its path needs
an explicit `return` in front of it, or the next `res.*` call throws `ERR_HTTP_HEADERS_SENT` —
inside the error handler, where an exception has nowhere left to go.

### CORS

`app.ts` parses `ALLOWED_ORIGIN` as a **comma-separated list** and passes the array to `cors`,
falling back to `*` when unset. Lets the deployed Netlify origin and `http://localhost:5173`
coexist. Wildcard is safe here only because auth is a Bearer header, not a cookie — no
`credentials: true`.

---

## Authentication Flow (`web/`)

```
Login/Register → backend returns { token, email }
useAuth writes both to localStorage AND to React state
  → storage is the router's source of truth (read synchronously in beforeLoad)
  → React state is the UI's source of truth (drives re-render)
On app load, useAuth restores both via lazy useState initialisers — before first paint
api.ts calls authHeaders(), which reads the token from storage per request
Backend authMiddleware verifies, attaches userId; controllers scope every query by it
```

Deliberate choices, carried from the migration sessions:

- **No module-level token variable.** `app/`'s `api.ts` kept `let token` alongside React state —
  two copies that could disagree, and React never re-rendered on the module one. `web/` reads
  storage per request instead. Side benefit: a login in another tab is picked up immediately.
- **`api.ts` reads storage directly**, accepting that it needs a DOM mock to unit-test. Deliberate
  trade at this size.
- **Storage failures swallow rather than surface.** A `SecurityError` from blocked site data is
  permanent for that browser, so a banner the user cannot act on is noise. Reads return `null`,
  writes no-op.
- **Stale per-user state** is cleared by each hook on its falsy-token branch. The scalable
  alternative — `<AuthProvider>` + `<WordDataProvider key={token}>` — is noted for when the
  provider grows.

---

## Routing (`web/`)

File-based: `src/routes/` mirrors the URL, `routeTree.gen.ts` is generated by the Vite plugin
(which must run **before** `react()`).

```
__root.tsx          bare <Outlet />
├── login.tsx       "/login"     public
└── _authed.tsx     (no URL)     beforeLoad guard + <Outlet />
    ├── index.tsx           "/"
    └── lessons/
        ├── index.tsx       "/lessons"
        └── $collectionId.tsx  "/lessons/:collectionId"
```

### The guard lives in one pathless layout route

```typescript
// _authed.tsx
beforeLoad: () => {
  if (!readStored(TOKEN_KEY)) throw redirect({ to: "/login" })
}
```

Not copy-pasted per route. The argument that settled it: copy-paste fails by **omission** — add
`/profile` later without the guard and nothing errors, it just serves unprotected. With a layout,
nesting *is* the protection. Secondary benefit: `_authed.tsx` is where the shared shell (nav,
logout) goes later.

Route **ids** keep the `_authed` segment (`"/_authed/lessons/"`); **URLs** do not (`/lessons`).

**`beforeLoad` runs on navigation, not on render or state change** — hard load/F5 at that URL, a
`<Link>` click, a programmatic `navigate()`, or `router.invalidate()`. The router watches the URL;
it is indifferent to React state. So `handleLogin` must call `navigate({ to: "/" })` itself, and
`handleLogout` must call `navigate({ to: "/login" })` — setting state moves nothing.

`navigate()` belongs inside the `try`, after the `await`, so a failed login does not navigate and
get bounced back by the guard.

### Links are typed, not interpolated

```tsx
<Link to="/lessons/$collectionId" params={{ collectionId: item._id }}>
```

`to` is a route id checked against the generated tree and `params` is typed to that route's params,
so a renamed route or a typo'd param is a **compile error**. A template literal throws both away.
Consequence for ordering: a route must exist before anything can link to it.

---

## Data loading (`web/`)

**Route `loader`s, never `useEffect`.** The mapping that stuck: the loader is the controller, the
component is the view; `useEffect`-fetching is a JSP opening its own DB connection.

```tsx
// $collectionId.tsx
loader: async ({ params }) => {
  try {
    const [collection, words] = await Promise.all([
      getCollection(params.collectionId),
      getWordsByCollection(params.collectionId),
    ])
    return { collection, words }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) throw notFound()
    throw error
  }
},
component: LessonDetailRoute,
notFoundComponent: LessonNotFound,
errorComponent: LessonError,
```

Four things this buys that an effect structurally cannot:

1. **No dataless paint.** An effect cannot run until its component has mounted and committed, so
   there is always at least one render with no data — and a blank list is indistinguishable from an
   empty lesson.
2. **No waterfalls.** A nested route's effect can't start until its parent has rendered, which can't
   happen until the parent's fetch resolves. The router knows the whole matched tree before
   rendering anything and fires every loader in parallel.
3. **Data outlives the component.** Back-navigation doesn't refetch, and `router.invalidate()` is an
   explicit refetch. Effect state dies with the component every time.
4. **No race condition.** Navigating A→B fast, an effect can land A's response after B's and render
   A's words under B's heading. The fix is a cleanup `ignore` flag most hand-rolled effects don't
   have. A loader is tied to a navigation the router can cancel.

**`loader: () => getCollections()`, never `loader: getCollections()`.** The second *calls* the
function at module-evaluation time — and `routeTree.gen.ts` statically imports every route module at
startup, so the fetch fires before login with no token. Worse, a promise is a value that settles
once: after a successful login, every navigation receives the same rejected promise until a full
page reload, and `router.invalidate()` cannot help.

Loader caching is **untuned** — `staleTime` defaults to 0, so every navigation revalidates. No route
uses `pendingComponent` (the router shows one after 1s by default). No root-level
`notFoundComponent` for URLs matching no route at all.

### The route/component split

Route file holds the route and an adapter component that reads `Route.useLoaderData()` and passes
props down; `components/` holds the real component, which never touches the router. So
`LessonDetailPage` can be rendered with a hand-made array and asserted on — no router context, no
loader, no `fetch` mock.

The alternative is `getRouteApi("/_authed/lessons/")`, which removes the adapter but couples the
component to a route id. Chosen against, for testability.

---

## API client (`web/src/api.ts`)

```typescript
export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) { ... }
}

const throwIfFailed = async (response: Response, message: string): Promise<void>
const handleResponse = async <T>(response: Response, message: string): Promise<T> =>
  { await throwIfFailed(response, message); return response.json() }
```

`throwIfFailed` reads `{ message }` off the error body when it's there and falls back to a
passed-in default, then throws an `ApiError` carrying `response.status`. `handleResponse<T>` is
three lines on top of it. Functions with no response body (`deleteWord`, `deleteCollection`) call
`throwIfFailed` directly — there is no separate no-body helper, because `throwIfFailed` *is* it.
The 204 special case disappeared with it: nothing parses a body unless a caller asked for a `T`.

Details worth keeping:

- **Every call is awaited.** An unawaited `throwIfFailed` makes the caller resolve before the check
  runs and turns the error into an unhandled rejection. `try/catch` catches stack unwinding; a
  rejection an event-loop turn later is not on that stack.
- The error body is narrowed from `unknown`, not read off `any`:
  `typeof x === "object"` → `x !== null` (because `typeof null === "object"`) → `"message" in x` →
  `typeof x.message === "string"`. No casts anywhere.
- Parsing the error body is wrapped in a `try/catch` because a 502 from Render's proxy is HTML.
  That `catch` must wrap **only** the parse — with the `throw` inside it, it swallows the error it
  is building.
- A `Response` body is a one-shot stream. Read it once.
- `erasableSyntaxOnly` bans constructor parameter properties, so `ApiError` declares and assigns
  its field explicitly.

`LoginPage`'s catch can now narrow on `status === 401` instead of claiming "invalid email or
password" for every fault. **Not yet done.**

---

## Testing (`web/`)

```
vite.config.ts   test: { environment: 'jsdom', setupFiles: './src/setupTests.ts' }
setupTests.ts    jest-dom matchers + afterEach(cleanup)
npm test         vitest
```

**`globals: false` is deliberate** — `describe`/`it`/`expect` are imported explicitly in each file.
The catch, which cost a debugging session: React Testing Library installs its automatic cleanup only
if a global `afterEach` exists, and silently does nothing otherwise. Without the explicit
`afterEach(cleanup)` the DOM accumulates across tests and they start passing or failing because of
each other.

Conventions:

- Assert what a user can observe. Visible text and roles, never class names, div nesting, or that
  `.map` was called.
- `getByRole("heading", { name })` over `getByText` — asserts it really is a heading, so replacing
  the `<h1>` with a styled `<div>` fails.
- `getBy`/`getAllBy` throw when nothing matches; `queryBy`/`queryAllBy` return `null`/`[]`. Absence
  assertions need the `query` variants.
- An empty-state test asserts both halves: the message is present **and** no rows are rendered.
- A test that has never been seen failing is not a test. Break the code, confirm red, revert.

**What this suite does not cover, and can't:** the seam between `routes/*.ts` and the controllers.
`req.params` is a string dictionary, so TypeScript cannot relate the route literal
`"/collection/:collectionId"` to `req.params.id` — they're in different files with no type
relationship. Two bugs of exactly that shape were found on 2026-09-14, one of them years old. Only a
test where Express's real routing runs (`supertest` against the exported `app`) catches them; the
database can be mocked, because it isn't the thing under suspicion.

---

## Styling (`web/`)

`src/index.css` is `@import "tailwindcss"` plus an `@theme` block that is **the single source of
truth for the palette and scale**. `app/src/theme/` is a duplicate and is deleted at cutover.

Decision taken: extend `@theme` so the project's design scale *becomes* the utility scale
(`--text-sm: 13px`, `--radius-md: 10px`), rather than sprinkling bracket values or snapping the
design to Tailwind's defaults. The standing cost is that `text-sm` and `rounded-md` mean something
different here than in any external Tailwind documentation, so the override table in
`learning/tailwind-token-reference.md` has to stay honest.

Two token names are known smells: `--color-borderInput` produces camelCase in a class name, and
`--color-text-*` produces `text-text-primary`.

`learning/tailwind-token-reference.md` holds the full RN→Tailwind mapping in both directions, all
28 `sharedStyles` entries converted, and the list of web-only failure modes.

`sharedStyles.ts` is **not** being ported as an object of class strings — that keeps the
indirection while losing type-checked keys. `card`, `formCard`, `input`, the buttons and
`emptyState` become components; `container`, `list`, `cardRow`, `formActions` are one-line layout
utilities inlined at each use site.

### Two RN→CSS traps hit repeatedly

- **`items-*` / `justify-*` are inert without `flex`.** In React Native every `View` is flex by
  default; in CSS a `div` is `display: block`.
- **`justify-center` on a scrolling container hides content.** Overflow is split across both ends,
  and overflow past the *start* edge is unreachable because `scrollTop` cannot go negative. Use
  `justify-start`, or `justify-center-safe` (Tailwind 4.1+) which falls back to start when the
  content no longer fits. Already fixed once in `app/` on the quiz setup screen; hit again in
  `web/`.

---

## Environment Variables

### `web/`
Vite loads `.env.development` for `vite dev` and `.env.production` for `vite build`, so targets
switch by mode rather than by hand-editing one file. Both are gitignored; `.env.example` is
committed and is the only documentation of what the app needs.

```
VITE_API_URL=http://localhost:3000/api          # .env.development
VITE_API_URL=https://<render>.onrender.com/api  # .env.production
```

Only `VITE_`-prefixed variables reach client code, and they are **inlined at build time** — public
by design. Secrets never go here.

### `backend/.env`
```
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
ALLOWED_ORIGIN=https://<netlify>.netlify.app,http://localhost:5173
```

---

## State Management

### Context (`WordAppContext`)
Provides `words`, `collections`, `token`, `email`, `loading`, `error`, and every handler:
`handleAddWord`, `handleDeleteWord`, `handleAddCollection`, `handleDeleteCollection`,
`handleRenameCollection`, `handleLogin`, `handleRegister`, `handleLogout`.

`isLoading` was removed in the `web/` port — it existed to cover AsyncStorage's async restore, and
`localStorage` is synchronous, so a lazy `useState` initialiser restores the token before first
paint. No auth flicker, no loading gate.

**Unreconciled:** the lessons routes read their data from loaders, not from this context, so
`words`/`collections` and the global `loading`/`error` banner are now partly redundant. The mutation
increment forces a decision about which owns what.

### `useReducer` — Quiz
```typescript
type QuizState = {
  wordPool: Word[]; quizWords: Word[]; translations: Word[]
  selectedWord: Word | null; matched: string[]; wrong: string | null; isAnimating: boolean
}
// START_QUIZ, SELECT_WORD, CORRECT_MATCH, WRONG_MATCH, RESHUFFLE, WRONG_ANIMATION_COMPLETE
```

`isAnimating` is a **race guard, not a re-render guard**: a tap during the 600ms wrong-match
animation would mutate state that the animation's completion callback then stomps on.

### `useReducer` — Flashcards
```typescript
type FlashcardState = {
  deck: Word[]; flagged: Word[]; current: Word | null; isFlipped: boolean; known: number
}
// START_FLASHCARDS, FLIP, GOT_IT, FLAG, REVIEW_FLAGGED
```

Both reducers ported to `web/` unchanged (only `import type`). Neither is wired up yet.

---

## Key Features (as built in `app/`)

**Lessons** — create, rename, delete; cascade delete removes the lesson's words; inline rename
toggle; empty states. *List and detail ported to `web/`; create/rename/delete not yet.*

**Words** — add to a lesson, delete; scoped per user and per lesson. *Read-only list ported.*

**Matching quiz** — conveyor belt: 5 cards visible, the pool feeds in as matches happen. Wrong
match flashes red via the RN `Animated` API; correct flashes green before reshuffle. Multi-
collection selection, custom word count (min 20) or all, progress bar, `isAnimating` input guard.

**Flashcards** — Word→Translation or Translation→Word; tap to flip; Got it / Flag; flagged cards
reviewed after the main deck; progress bar; end screen with score breakdown.

**Quiz setup** — multi-collection checkboxes, direction toggle, word count selector with
validation.

> The wrong-match animation is the one feature with **no direct web equivalent**. RN `Animated`,
> `interpolate` and `Animated.createAnimatedComponent(TouchableOpacity)` do not exist in `web/`;
> it becomes a CSS transition or a Web Animations API call.

---

## Migration status

| Layer | Status |
|---|---|
| `types.ts`, `utils/shuffle.ts`, both reducers | ported unchanged |
| `api.ts` | ported, then rewritten on `ApiError` + `throwIfFailed`/`handleResponse<T>` |
| `storage.ts` | new — replaces AsyncStorage |
| `useAuth` | rewritten on `localStorage`; `isLoading` deleted |
| `useWords`, `useCollections` | ported; token arg dropped, clear on logout |
| `WordAppContext` | ported minus `isLoading`; role vs loaders unreconciled |
| Auth screen + routing + guard | **done** |
| Lessons list + detail (read) | **done** — loaders, typed links, not-found |
| Lesson create / rename / delete | **next** |
| Quiz, flashcards, profile screens | not started |
| `theme/` → `@theme` | palette + scale done; per-screen styles as screens are ported |
| Test harness | `web/` done (1 file); backend none |
| Netlify build target | not started |

---

## Planned Next Steps

1. **Route tests with `supertest`** — the gap two param bugs exposed. Hit the exported `app` so the
   route table and the controllers must agree.
2. **➤ Reconcile loaders vs `WordAppContext` — do this first, before any mutation code.**
   Lesson data currently lives in two places that don't talk to each other. The options, to be
   argued rather than defaulted into:
   - **Loaders own server data; context keeps only auth.** `words`/`collections` and the global
     `loading`/`error` banner come out; writes call `router.invalidate()` to refetch. Fewest moving
     parts, and the direction TanStack is built for.
   - **Context stays the cache; loaders seed it.** Keeps the existing hooks and handlers, at the
     cost of a synchronisation path that has to be right in both directions.
   - **Add TanStack Query** and let the router coordinate while Query owns the cache. Answers the
     question properly and adds a dependency — see the *External Data Loading* guide before
     choosing this.

   Whichever is chosen, `handleAddWord`/`handleDeleteCollection` and friends need rewriting to
   match, so choosing after the mutations are written means writing them twice.

3. **Lesson create / rename / delete** — the mutation side, on top of the decision above. Mutations
   have no `loader`, so the new mechanism is `router.invalidate()` and the cache model.
4. **Add-word / delete-word** on the detail route.
5. **Quiz + flashcards slice** — the hard one: `collectionIds: string[]` and
   `wordLimit: number | "all"` have to survive a query string, and hand-edited URLs must be
   rejected. TanStack Router's `validateSearch`. Plus replacing the RN `Animated` wrong-match flash.
6. **Cutover** — delete `app/`, repoint Netlify at the Vite build, deploy the backend CORS change,
   move the remaining cheatsheets out of `app/learning/`.

### Bonus / deferred
- Narrow `LoginPage`'s catch to `status === 401` now that `ApiError` carries it.
- Root-level `notFoundComponent`; `pendingComponent`s; tune `staleTime`.
- Backend input validation layer (nothing validates `req.body` before Mongoose).
- Word edit; statistics (quiz success rate per word); 3D flashcard flip; pagination for large word
  lists; spaced repetition for flagged flashcards.
- Router-context auth + `router.invalidate()` when the guard outgrows a token check.
- Splitting the provider into `<AuthProvider>` + `<WordDataProvider key={token}>`.

---

## Key Lessons Learned

- `useReducer` vs `useState` — atomicity, not tidiness: use it when several pieces of state must
  move together.
- JWT auth end to end; per-user scoping via middleware.
- MongoDB `_id` vs frontend ids — transform at the API boundary.
- Fisher-Yates vs the biased `sort(() => Math.random())`: an inconsistent comparator only compares
  the pairs the sort algorithm happens to visit, so elements drift near their starting index.
- **`key` is not a re-render — it is unmount plus remount.** Different key means "a different
  thing", so hook state goes with the old instance. It belongs on the element in the parent.
- **Route guards fire on navigation, not on state change.** The router watches the URL.
- **A component is not a function you call.** `Navigate({ to: "/" })` invokes hooks outside render
  and throws.
- **`try/catch` cannot catch a promise you didn't `await`.** It catches stack unwinding; a rejection
  an event-loop turn later isn't on that stack.
- **A promise is a value, not a recipe.** It settles once and keeps that result forever. Anything
  that must run per navigation has to be a function.
- **Parallelise unless there's a data dependency.** A *validity* dependency — "don't bother if the
  first one 404s" — optimises the rare path at the cost of the common one.
- **A special case often disappears when you move the code path instead of guarding it.** A
  condition you can delete beats a condition you get right.
- **A bare `catch` that asserts a cause is a lie**, and an API layer that discards HTTP status makes
  honest handling impossible upstream. Catch narrowly, rethrow what you didn't recognise.
- **`res.json()` does not end an Express handler.** Sending a response is a side effect.
- **Two layers can both be individually correct and still produce a wrong result.** The backend was
  right to distinguish malformed from missing; the frontend was right not to blanket-map 400s; the
  user still got a crash page for a bad URL. Resolve at the layer that knows what the user can act
  on.
- **`any` doesn't remove a problem, it hides it.** Typing `parseObjectIdParam`'s parameter honestly
  immediately surfaced that `req.params` values are `string | string[]`.
- **Lowercase primitives in TypeScript.** `Boolean`/`String`/`Number` are wrapper object types.
- **Verify every call site after extracting a helper**, and be suspicious when a refactor makes
  failures *quieter* — two param bugs went from a visible `400 Invalid input` to a plausible
  `404 Not found`.
- **A test that passes because of another test is not passing**, and a test never seen failing is
  not a test.
- **Utility classes trade the compiler for variants.** Unknown classes are silently dropped,
  unitless arbitrary values are generated then discarded, and `justify-*`/`items-*` are inert
  without `flex`. A style-object typo was a TypeScript error; a `className` typo is not.
- **Never move a shared design token to fix one component.**
- Sync vs async storage has consequences all the way up: it is what lets the route guard be a
  one-line synchronous read and what let `isLoading` be deleted.
- Vite `VITE_` vars are inlined at build time and are public; mode files beat editing one `.env`.
- Expo web deployment quirks vs standard React; monorepo structure for full-stack projects.
