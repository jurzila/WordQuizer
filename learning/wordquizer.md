<!-- MAINTENANCE: this file goes stale as the project moves. Update the "Current state"
block below at the end of any session that changed the codebase. The rest of the file is
the durable architecture description and only needs updating on bigger structural changes. -->

# Current state

- **Last updated:** 2026-09-11
- **Working on:** migrating the frontend from Expo/React Native (`app/`) to Vite + React
  (`web/`). The **auth slice is complete** — register, login, logout, a guarded `/` route, and
  refresh without losing the session. Next increment is the **lessons slice**
  (`/lessons`, `/lessons/$collectionId`), which introduces dynamic path params and route loaders.
- **Branch:** `feature/migration-to-react`. `web/` is not yet committed.
- **Known weak spots:**
  - `api.ts` (both copies) throws bare `Error`s and **discards `response.status`**, so no caller
    can distinguish 401 from 500 from a network failure. `LoginPage`'s catch consequently claims
    "invalid email or password" for every possible fault. Fix is an `ApiError` carrying status plus
    one shared `handleResponse`; deferred as out of migration scope.
  - No automated tests anywhere, in any layer.
  - No input validation layer on the backend.
  - No pagination on word lists.
  - Error handling is a single global banner (`loading`/`error` in context).
  - `backend/src/app.ts` CORS change (comma-separated origin list) is **written but not deployed** —
    needs a merge to `main` and the `ALLOWED_ORIGIN` env var updated in the Render dashboard.
  - Netlify still builds and serves the Expo export. Repointing it is part of cutover.
  - Three cheatsheets still sit in `app/learning/`, which is deleted at cutover. Session logs and
    new references now live in top-level `learning/`.

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
| Status | complete, deployed, **deleted at cutover** | auth slice done, rest to port |

Both talk to the same Express backend. `app/` stays until `web/` reaches parity, then is deleted
outright — the migration is a rewrite beside it, not an in-place conversion.

---

## Tech Stack

### `web/` — the active frontend
- **Vite 8** + **React 19.2** + **TypeScript 6** (`strict: true`)
- **TanStack Router 1.170** — file-based routing, `@tanstack/router-plugin` codegen
- **Tailwind CSS v4.3** via `@tailwindcss/vite`
- **oxlint** for linting
- `localStorage` for token/email persistence

### `app/` — the legacy frontend
- React Native + Expo, React Navigation, AsyncStorage, RN `Animated` API

### Backend
- **Node.js** + **TypeScript**, **Express 5**
- **Mongoose 9** → **MongoDB Atlas** (free tier)
- **JWT** (`jsonwebtoken`), **bcryptjs**
- `nodemon` for dev

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
│   │   ├── api.ts                # fetch functions; reads token from storage per request
│   │   ├── storage.ts            # readStored/writeStored/clearStored, try/catch wrapped
│   │   ├── types.ts
│   │   ├── routes/               # file-based routing — filesystem mirrors the URL
│   │   │   ├── __root.tsx        # bare <Outlet />, no shell yet
│   │   │   ├── index.tsx         # "/" — beforeLoad guard + Home
│   │   │   └── login.tsx         # "/login"
│   │   ├── routeTree.gen.ts      # generated, gitignored
│   │   ├── components/
│   │   │   └── LoginPage.tsx
│   │   ├── context/WordAppContext.tsx
│   │   ├── hooks/                # useAuth, useWords, useCollections
│   │   ├── reducers/             # quizReducer, flashcardsReducer (ported, unused so far)
│   │   └── utils/shuffle.ts
│   ├── vite.config.ts            # tanstackRouter() BEFORE react(), plus tailwindcss()
│   ├── .env.development          # VITE_API_URL=http://localhost:3000/api
│   └── .env.production           # VITE_API_URL=<render url>/api
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
│   │   ├── controllers/          # auth, word, collection
│   │   ├── routes/               # auth, word, collection
│   │   ├── middleware/auth.ts    # JWT verification
│   │   └── types/express.d.ts    # AuthRequest extension
│   └── .env                      # PORT, MONGODB_URI, JWT_SECRET, ALLOWED_ORIGIN
│
└── learning/                     # session logs + references (survives cutover)
```

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
```

---

## API Endpoints

All routes except auth require `Authorization: Bearer <token>`.

```
POST   /api/auth/register            { email, password } → { token, email }
POST   /api/auth/login               { email, password } → { token, email }

GET    /api/collection               → Collection[]
POST   /api/collection               { name } → Collection
PUT    /api/collection/:id           { name } → Collection
DELETE /api/collection/:id           → { message, wordsDeleted }   // cascade

GET    /api/word                     → Word[]
GET    /api/word/collection/:id      → Word[]
POST   /api/word                     { word, translation, collectionId } → Word
DELETE /api/word/:id                 → 204
GET    /api/word/quiz?collectionIds  → Word[] (30 random via $sample)

GET    /health                       → { status: "ok" }
```

All collection and word controllers filter by `userId` from the JWT.

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
__root.tsx        bare <Outlet />
├── index.tsx     "/"      beforeLoad guard → Home
└── login.tsx     "/login" LoginPage
```

The guard:

```typescript
beforeLoad: () => {
  if (!readStored(TOKEN_KEY)) throw redirect({ to: "/login" })
}
```

**`beforeLoad` runs on navigation, not on render or state change** — hard load/F5 at that URL, a
`<Link>` click, a programmatic `navigate()`, or `router.invalidate()`. The router watches the URL;
it is indifferent to React state. So `handleLogin` must call `navigate({ to: "/" })` itself, and
`handleLogout` must call `navigate({ to: "/login" })` — setting state moves nothing.

`navigate()` belongs inside the `try`, after the `await`, so a failed login does not navigate and
get bounced back by the guard. Using the guard as error handling works by accident and breaks the
day the route becomes anonymous-viewable.

The guard reads `localStorage` directly rather than router `context`. Simplest thing that works,
and it only works *because* the store is synchronous. Router-context auth plus
`router.invalidate()` is the scalable version, deferred until the guard needs more than a token
check.

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
28 `sharedStyles` entries converted, and the list of web-only failure modes (unknown classes are
silently ignored; unitless arbitrary values are generated then discarded by the browser;
`justify-*`/`items-*` are inert without `flex`).

`sharedStyles.ts` is **not** being ported as an object of class strings — that keeps the
indirection while losing type-checked keys. `card`, `formCard`, `input`, the buttons and
`emptyState` become components; `container`, `list`, `cardRow`, `formActions` are one-line layout
utilities inlined at each use site.

---

## Environment Variables

### `web/`
Vite loads `.env.development` for `vite dev` and `.env.production` for `vite build`, so targets
switch by mode rather than by hand-editing one file.

```
VITE_API_URL=http://localhost:3000/api        # .env.development
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

## Key Features (as built in `app/`, to be ported)

**Lessons** — create, rename, delete; cascade delete removes the lesson's words; inline rename
toggle; empty states.

**Words** — add to a lesson, delete; scoped per user and per lesson.

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
| `api.ts` | ported; `VITE_API_URL`, storage-per-request, no module token |
| `storage.ts` | new — replaces AsyncStorage |
| `useAuth` | rewritten on `localStorage`; `isLoading` deleted |
| `useWords`, `useCollections` | ported; token arg dropped, clear on logout |
| `WordAppContext` | ported minus `isLoading` |
| Auth screen + routing + guard | **done** |
| Lessons, quiz, flashcards, profile screens | **not started** |
| `theme/` → `@theme` | palette + scale done; per-screen styles as screens are ported |
| Netlify build target | not started |

---

## Planned Next Steps

1. **Lessons slice** — `/lessons` and `/lessons/$collectionId`. Dynamic path params, route
   `loader`s, and the loader-vs-`useEffect` question.
2. **Quiz + flashcards slice** — the hard one: `collectionIds: string[]` and
   `wordLimit: number | "all"` have to survive a query string, and hand-edited URLs must be
   rejected. TanStack Router's `validateSearch`. Plus replacing the RN `Animated` wrong-match flash.
3. **Cutover** — delete `app/`, repoint Netlify at the Vite build, deploy the backend CORS change,
   move the remaining cheatsheets out of `app/learning/`.

### Bonus / deferred
- `ApiError` carrying `status` + one shared `handleResponse`, replacing fourteen copies of
  `if (!response.ok) throw new Error(...)`; then narrow `LoginPage`'s catch to 401.
- Word edit; statistics (quiz success rate per word); 3D flashcard flip; pagination for large word
  lists; spaced repetition for flagged flashcards.
- Router-context auth + `router.invalidate()` when the guard outgrows a token check.
- Splitting the provider into `<AuthProvider>` + `<WordDataProvider key={token}>`.

---

## Key Lessons Learned

- `useReducer` vs `useState` — atomicity, not tidiness: use it when several pieces of state must
  move together.
- Race conditions between async loading and React effects.
- JWT auth end to end; per-user scoping via middleware.
- MongoDB `_id` vs frontend ids — transform at the API boundary.
- Fisher-Yates vs the biased `sort(() => Math.random())`: an inconsistent comparator only compares
  the pairs the sort algorithm happens to visit, so elements drift near their starting index.
- **`key` is not a re-render — it is unmount plus remount.** Different key means "a different
  thing", so hook state goes with the old instance. It belongs on the element in the parent; a
  component cannot reset itself this way. Consequence: an `[]`-effect inside re-runs on every key
  change (twice per mount in dev StrictMode).
- **Route guards fire on navigation, not on state change.** The router watches the URL.
- **A component is not a function you call.** `Navigate({ to: "/" })` invokes hooks outside render
  and throws; its real work is in a `useLayoutEffect` that only runs when React renders it.
- **A bare `catch` that asserts a cause is a lie**, and an API layer that discards HTTP status
  makes honest handling impossible upstream.
- **Utility classes trade the compiler for variants.** Unknown classes are silently dropped,
  unitless arbitrary values are generated then discarded by the browser, and `justify-*`/`items-*`
  are inert without `flex`. A style-object typo was a TypeScript error; a `className` typo is not.
- **Never move a shared design token to fix one component.**
- Sync vs async storage has consequences all the way up: it is what lets the route guard be a
  one-line synchronous read and what let `isLoading` be deleted.
- Vite `VITE_` vars are inlined at build time and are public; mode files beat editing one `.env`.
- Expo web deployment quirks vs standard React; monorepo structure for full-stack projects.
