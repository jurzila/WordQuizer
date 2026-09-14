# Session — 2026-09-11 — RN → React migration: auth slice (Tailwind + routing)

Completes the feature started 2026-08-31. Supersedes `checkpoint-2026-08-31-auth-slice.md`,
which can be discarded.

## Goal

**Works at the end:** a `web/` app where you can register, log in, land on `/`, refresh without
being logged out, and log out — against the same backend.

**Can explain at the end:** why a Tailwind utility class is not the same idea as a style object
even when it produces the same pixels, and why route guards fire on navigation rather than on
state change.

Both met. All six acceptance checks pass, `npx tsc -b --force` clean.

## Covered

**Tailwind v4 as a design system**
- `@theme` generates utility classes, not just CSS variables. `--color-x` → `bg-x`/`text-x`/`border-x`;
  `--radius-x` → `rounded-x`; `--text-x` → `text-x`.
- Chose option (b): extend `@theme` so the project's scale *becomes* the utility scale, rather than
  bracket values everywhere (a) or snapping the design to Tailwind (c).
- The standing cost of (b): `text-sm` and `rounded-md` no longer mean what external Tailwind
  documentation says they mean. Adding a name (`--text-md`) is free; redefining a canonical one
  (`text-lg` 18→20) makes every external reference wrong.
- Utility classes have **no merge semantics**. RN's `style={[a, b]}` had defined precedence; two
  Tailwind classes setting the same property resolve by generated-stylesheet order. Pick one
  conditionally, never layer an override.
- Built `learning/tailwind-token-reference.md` — lookup in both directions, all 28 `sharedStyles`
  entries converted, values read from `node_modules/tailwindcss/theme.css` rather than recalled.

**The silent-failure theme** — every styling mistake this session failed without a single warning:
- unknown class (`raidius-md`) — Tailwind generates nothing, no error
- unitless arbitrary value (`max-w-[400]`) — class generated, browser discards the declaration
- missing `flex` — `justify-center`/`items-center` are inert on a `display: block` div
- wrong-but-valid token (`bg-background` on a card) — renders one shade off, forever

The compiler caught none of them. This is the actual trade for gaining variants and responsive
prefixes: `styles.crad` was a compile error, `className` is a string.

**RN → web structural gaps** (classes that translate nothing and exist to fix the web):
- every RN `View` is already `display: flex; flex-direction: column`; a `div` is `display: block`
- `<label>` is inline, so vertical margins do nothing without `block`
- `gap` requires a flex/grid parent
- `<input>` has an intrinsic ~20ch width; RN's filled its parent — needs `w-full`
- a `<button>` centres its own text (`text-center`, not `items-center` + `flex`)
- `disabled:` variant replaces a separate `primaryButtonDisabled` style

**Design tokens vs local values.** Changed `--radius-md` from 10px to 16px to fix one card. That
token is `radius.md`, used by every input and button — one component's local value was pushed into
a shared token. The card's 16px was stock `rounded-2xl` all along.

**Routing — the concept of the slice**
- `beforeLoad` is **client-side** and runs on every *navigation* to a route: hard load/F5 at that
  URL, `<Link>` click, programmatic `navigate()`, `router.invalidate()`. Not on render, not on
  state change. It is not server middleware.
- The router watches the URL, not React state. `setTokenState(...)` updates state and storage,
  both of which the router is indifferent to — the URL stays `/login`, so `/login` stays matched.
  You must cause the navigation yourself.
- `navigate()` belongs in the `try`, after the `await`, so it cannot run on a failed login.
  Navigating anyway means bouncing through the guard and using it as error handling.
- Same on logout: `navigate({ to: "/login" })` explicitly. Navigating to `/` and letting the guard
  bounce you works today and breaks silently the day `/` becomes anonymous-viewable.
- The guard reads `localStorage`, not React state — so the write must precede the navigate. True
  by construction here because the store is synchronous. That was load-bearing, not incidental.

**`Navigate` vs `useNavigate`.** `Navigate` is a component whose first line is `useRouter()` and
whose work happens in `useLayoutEffect`. Calling `Navigate({ to: "/" })` from an event handler
calls a hook outside render — React throws, and the real navigation (in the effect) never happens
because nothing rendered.

**Error handling**
- A bare `catch { setError("Invalid email or password") }` asserts a cause it never checked. The
  backend returned 200 and the UI reported bad credentials; the actual fault was the `Navigate`
  call throwing inside the same `try`. Cost about an hour.
- Root cause is one layer down: every function in `api.ts` does
  `if (!response.ok) throw new Error("Failed to ...")` and **discards `response.status`**. The UI
  cannot narrow what the API layer destroyed. Same defect as catching `SQLException` and
  rethrowing `new RuntimeException("db error")`.

**Tooling**
- Vite env: only `VITE_`-prefixed vars reach client code, and they are **inlined at build time** —
  public by design, never for secrets. Mode files (`.env.development` / `.env.production`) switch
  automatically instead of hand-editing one `.env`.
- CORS: `origin` accepts an array, so `ALLOWED_ORIGIN` now parses a comma-separated list
  (`backend/src/app.ts`). A Vite `server.proxy` is the zero-deploy alternative — same-origin to the
  browser, so CORS never applies — but it is dev-server only.

## What landed

- The `@theme` mechanism, and the reasoning for choosing (b) over brackets — the trade-off was
  articulated correctly and unprompted.
- "The address bar stays `/login`" — identified immediately once pointed at the URL, which is the
  crux of the whole routing concept.
- `navigate()` belongs in the `try` after the `await` — reasoned to directly from the failure case.
- `React.SubmitEvent<HTMLFormElement>` — more precise than the `React.FormEvent` suggested, and
  correct for React 19.
- `htmlFor`/`id` pairing, `autoComplete`, `type="button"` on the toggle — all correct first time.
- Reading `email` from context instead of `localStorage` in a component.

## Shaky

1. **`key` as a state-reset mechanism — still not solid.** Answered "React will do a re-render";
   it is unmount-and-remount. A re-render is exactly what preserves state. Then miscounted the
   follow-up: an `[]`-effect after one key change logs **2 in production, 4 in dev** (two mounts,
   StrictMode double-invoking each) — answered "2, because StrictMode", applying the doubling to
   one mount when there were two. Third session in a row this has come back.
2. **`beforeLoad` timing.** Answered "before the application is loaded in the browser" — it is
   client-side, after React boots, and runs on *every* navigation to the route, not only the first.
3. **Tailwind lookup discipline.** Four faults across two style objects: wrong token, wrong size,
   missing unit, missing `flex`. The model is understood; the habit of checking the number being
   replaced is not there yet. The reference file is the mitigation, not repetition.
4. **Shared token vs local value** — `--radius-md` 10px → 16px to fix one card.
5. **`Navigate` vs `useNavigate`** — reached for the component and called it as a function.

## Open questions

- **Does the error message survive a guard bounce?** If a failed login navigates to `/` and
  `beforeLoad` redirects back to `/login`, does the router unmount `LoginPage` and take the `error`
  state with it? Reasoned about, never verified in the browser. Same mechanism as (1) above, which
  is why it is worth actually checking.
- **`--text-sm--line-height` left inherited.** `--text-sm` was overridden to 13px; the paired
  line-height token still carries the ratio derived from 14px (≈1.4286), giving an 18.6px line box.
  Not decided, just inherited.
- **Token naming.** `--color-borderInput` → `border-borderInput` (camelCase in a class name);
  `--color-text-*` → `text-text-primary` (doubled word). Both work, both read badly.
- **`ApiError` deliberately deferred** as out of migration scope. See Next session.
- **`app/learning/` still sits inside the folder deleted at cutover.** `learning/` now exists at
  top level with two files in it; the other three still need moving.
- **Netlify still points at the Expo build.** Untouched. Cutover session.

## Practice task

Priority over the reading. All small, all in `web/`:

1. **Finish review item 3** — `handleSubmit`'s two branches are still identical except for which
   function they call. Collapse to `const submit = isRegistering ? handleRegister : handleLogin`.
   Not done this session.
2. **`logout` in `routes/index.tsx` is still `async`** with nothing to await — it now returns a
   Promise for no reason. Drop the keyword.
3. **Delete the `BASE_URL` fallback** in `api.ts` — `http://192.168.0.110:3000/api` is a leftover
   LAN address from Expo device testing. If `VITE_API_URL` fails to load, the app silently talks to
   whatever is at that IP instead of failing loudly.
4. **Rename the two smelly tokens** — `--color-borderInput` → `--color-border-input`,
   `--color-text-*` → `--color-ink*`. Two files. Do it now while `LoginPage` is the only consumer.
5. **Verify the open question above** in the browser: temporarily move `navigate({ to: "/" })`
   outside the `try`, submit a wrong password, and watch whether the error text renders before the
   bounce. Then put it back.

## Reading

**Read this one before the next session.**
[TanStack Router — Authenticated Routes](https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes).
Covers the two things deliberately skipped: threading auth through router `context` instead of
reading `localStorage` inside `beforeLoad`, and the `redirect` search-param round trip so a bounced
user returns to the page they wanted. Also explains `isRedirect()` — why a thrown redirect must not
be caught as an error, which is the same lying-catch failure from today in the router's own
lifecycle.

**Deeper, when wanted.**
[Tailwind CSS — Theme variables](https://tailwindcss.com/docs/theme). The namespace mechanism
behind everything used today, and the `--color-*` vs `:root` distinction — when a value should
generate utilities and when it should stay a plain CSS variable. Read the section on overriding
versus extending a namespace; it is exactly the option (b) decision and its consequences.

**Source to read.**
`web/node_modules/@tanstack/react-router/dist/esm/useNavigate.js` — about 60 lines. `useNavigate`
and `Navigate` sit next to each other, so the component-wrapping-a-hook pattern is visible in one
screen, along with why `Navigate` can only work when rendered. Worth reading properly rather than
the twelve lines grepped today.

## Next session

**The lessons slice** — `/lessons` (collection list) and `/lessons/$collectionId` (detail). The
natural next vertical increment, and it introduces the piece routing has not covered yet: dynamic
path params, route `loader`s, and where data fetching belongs once the router can do it. `useWords`
and `useCollections` port unchanged; the screens do not.

**Set up first:** read the TanStack authenticated-routes guide above, and skim the router's
`loader` documentation so the loader-vs-`useEffect` question is live rather than new.

**Bonus increment, when migration allows** — `ApiError` carrying `status` plus a shared
`handleResponse` helper, replacing fourteen copies of `if (!response.ok) throw new Error(...)`.
Then narrow `LoginPage`'s catch to claim "invalid credentials" only on 401. Agreed this session as
out of migration scope, but it is the fix for a defect that already cost an hour.

## Reference updates

For `references/wordquizer.md`:

- **Current state → Last updated:** 2026-09-11.
- **Working on:** auth slice of the `web/` rewrite is complete — register, login, logout, guarded
  `/`, refresh-safe. Next is the lessons slice.
- `web/` is real now, not "future": Vite 8, React 19.2, TS 6, Tailwind 4.3.3, TanStack Router 1.170.
  File-based routing in `src/routes/`. `localStorage` via `src/storage.ts` replaces AsyncStorage.
  `api.ts` reads the token from storage per request — the module-level `token` variable is gone.
- `@theme` in `web/src/index.css` is the palette and scale source of truth. `app/src/theme/` is
  duplicated and gets deleted at cutover.
- **Backend changed:** `ALLOWED_ORIGIN` now parses a comma-separated list of origins
  (`backend/src/app.ts`). Not yet deployed — needs a merge to `main` and the Render env var updated.
- **Known weak spots — add:** `api.ts` discards HTTP status codes, so no caller can distinguish 401
  from 500; error handling in `LoginPage` claims a cause it never checks.
- **Known weak spots — unchanged:** no automated tests anywhere; no pagination; no backend input
  validation.
- **Planned next steps:** replace the rewrite plan with the lessons slice, then quiz/flashcards,
  then cutover (delete `app/`, repoint Netlify, move `app/learning/`).
