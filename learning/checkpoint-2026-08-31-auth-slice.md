# Checkpoint — RN → React migration, auth slice — 2026-08-31

## Goal (unchanged from session start)

**Works at the end:** a `web/` app (Vite + React + TS + Tailwind v4 + TanStack Router) where you can
register, log in, land on a placeholder home page, **refresh without being logged out**, and log out —
against the same Render backend.

**Can explain at the end:** why React and React Native share the entire hooks/state/context layer but
nothing below it, and which layers of this app had to be rewritten as a result.

---

## Done so far

**Scaffold** — `web/` created. Vite 8, React 19.2, TS 6, Tailwind 4.3, TanStack Router 1.170.
- `vite.config.ts`: `tanstackRouter()` **before** `react()`, plus `tailwindcss()`.
- `src/index.css` is `@import "tailwindcss";` — no `@theme` block yet.
- `strict: true` added to `tsconfig.app.json` (the scaffold shipped without it).
- `.env` created with `VITE_API_URL`.

**Non-visual layer ported and compiling:**
- `types.ts`, `utils/shuffle.ts`, `reducers/*` — untouched apart from `import type`.
- `api.ts` — `process.env.EXPO_PUBLIC_API_URL` → `import.meta.env.VITE_API_URL`. Module-level
  `let token` and `setToken()` **deleted**; `authHeaders()` reads storage per request. `authToken?`
  params dropped from `getWords`/`getCollections`.
- `storage.ts` — **new**. `readStored`/`writeStored`/`clearStored`, each wrapping `localStorage` in
  `try/catch` (swallow-and-degrade). `TOKEN_KEY`/`EMAIL_KEY` live here.
- `hooks/useAuth.ts` — rewritten on `localStorage`. Both `token` and `email` restore via **lazy
  `useState` initialiser**. `isLoading` **deleted**. `handleLogout` sets `null`, not `""`.
- `hooks/useWords.ts`, `hooks/useCollections.ts` — token argument dropped at call sites; `token`
  retained as guard + effect trigger. Both now `setWords([])` / `setCollections([])` on the
  logged-out branch.
- `context/WordAppContext.tsx` — `isLoading` removed from the context type and provider value.

**Routing, partially:**
- `main.tsx` — done. `createRouter({ routeTree })`, `Register` module declaration,
  `<WordAppProvider><RouterProvider /></WordAppProvider>`.
- `routes/__root.tsx` — done. Bare `<Outlet />`, no shell styling yet.
- `routes/index.tsx` — `beforeLoad` guard written and correct (`throw redirect({ to: "/login" })`
  when storage has no token).
- `src/routeTree.gen.ts` generated.

**Deleted / not ported:** `localStore.ts` (was dead code — nothing imported it).

**Reference written:** `app/learning/rn-to-react-cheatsheet.html`
(https://claude.ai/code/artifact/7379ec6b-0add-4fa0-a71e-1169de0d392f)

---

## In progress

`npx tsc -b` currently fails with ~8 errors, all in one file.

**`src/components/LoginPage.tsx` (159 lines) is a half-converted `AuthScreen`.** The *elements* were
swapped (`View`→`div`, `Text`→`h1`/`p`/`span`/`label`, `TouchableOpacity`→`button`) but the *props and
styles* were not:

- `style={styles.container}` — still RN style objects, ~15 occurrences. Needs `className` + Tailwind.
- `const styles = StyleSheet.create({...})` still at the bottom of the file (line 102).
- `sharedStyles` referenced but never imported — doesn't exist in `web/`.
- `onChangeText={(text) => …}` on two inputs — needs `onChange={(e) => … e.target.value}`.
- `secureTextEntry={true}` — needs `type="password"`.
- `style={[a, b]}` array-merge form in two places — has no web equivalent.

Two smaller gaps:
- `routes/index.tsx` references `Home` but never defines it.
- `routes/login.tsx` references `LoginPage` but never imports it.

---

## Next step

In order, smallest first:

1. Add the `@theme` block to `src/index.css`, mapping every value in `app/src/theme/colors.ts` to a
   `--color-*` token. Token name = class name, so `cardSelectedBorder` → `--color-card-selected-border`.
2. Convert `LoginPage.tsx` styles to Tailwind classes and delete the `StyleSheet.create` block and the
   `sharedStyles` references. **The unanswered exercise is still open** — convert
   `{ backgroundColor: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 400,
   borderWidth: 1, borderColor: "#e6e4da" }` and check it before doing the other twelve.
   Traps: off-scale values use brackets (`max-w-[400px]`); `borderWidth: 1` needs **two** classes
   because Tailwind v4 defaults border colour to `currentColor`.
3. Fix the RN props: `onChangeText` → `onChange`/`e.target.value`, `secureTextEntry` →
   `type="password"`, `keyboardType="email-address"` → `type="email"`.
4. Wrap the fields in `<form onSubmit>` with `e.preventDefault()`. The mode-toggle button needs
   `type="button"` or it submits.
5. Add `autoComplete="email"` / `"current-password"`, and `htmlFor`/`id` on the labels.
6. Define `Home` in `routes/index.tsx` (email + logout button, nothing more). Import `LoginPage` in
   `routes/login.tsx`.
7. Navigate after login and after logout — `useNavigate()`. **Route guards run on navigation, not on
   state change**, so setting `token` to `null` does not move the browser.
8. `npx tsc -b` clean, `npm run build` clean.
9. Manual pass: log in → `/` · **F5 → still on `/`, still logged in** · log out → `/login` · type `/`
   while logged out → bounced · Back button sane.

Step 9 is the acceptance test. Nothing is done until it passes.

---

## Decisions made

- **New `web/` folder** beside `app/`; `app/` gets deleted at cutover, not migrated in place.
- **File-based routing** over code-based — the filesystem mirrors the URL, which is the exact mental
  shift from in-memory stack to address bar.
- **`beforeLoad` reads `localStorage` directly**, not router `context`. Simplest thing that works, and
  it only works *because* the store is synchronous. Router-context auth + `router.invalidate()` is the
  scalable version; deferred until the guard needs more than a token check.
- **Storage failures swallow, not surface.** `SecurityError` from blocked site data is permanent for
  that browser, so a banner the user can't act on is noise. Reads return `null`, writes no-op.
- **`api.ts` reads storage directly**, accepting that it can't be unit-tested without a DOM mock.
  Deliberate trade at this size. Side benefit: a login in another tab is picked up immediately.
- **`@theme` becomes the single source of truth for the palette.** `theme/colors.ts` and
  `theme/spacing.ts` are duplicates once the port is done, and get deleted at cutover.
- **Stale per-user state** handled by each hook clearing its own on the falsy-token branch, rather
  than splitting the provider and using `key`. The split (`<AuthProvider>` +
  `<WordDataProvider key={token}>`) is noted as a refactor for when the provider grows.

---

## Stuck on / unresolved

- **Tailwind conversion is the live blocker.** The model landed (one style property ≈ one class,
  `@theme` for the palette, class number = px/4) but no conversion has been written yet.
- **`key` for resetting state — missed twice.** Both the logout-stale-data question and the
  `/lessons/abc` → `/lessons/xyz` form question. Ruled out already: dependency arrays, `try/catch`,
  manual clearing. This is first up in next session's quiz.
- **URL-serialisable route params — deferred to session 3.** `collectionIds: string[]` and
  `wordLimit: number | 'all'` have to survive a query string, and hand-edited URLs have to be
  rejected. TanStack Router's `validateSearch` is where that goes.
- **`app/learning/` sits inside the folder we delete at cutover.** Move it to a top-level `learning/`
  first or four cheatsheets go with it.
- **Netlify still points at the Expo build.** Untouched. Cutover session.

---

## Shaky — put these in the next recall quiz

From the opening quiz (scored 1.5 / 6):

1. **`isAnimating` in `quizReducer`** — it's a race guard, not a re-render guard. A tap during the
   600ms wrong-match animation mutates state that the animation's completion callback then stomps on.
2. **Two copies of the token** — module variable vs React state. Answered with "backend redeployed";
   the real issue was React not re-rendering on the module variable and requests firing before the
   restore. Now moot in `web/`, because the variable is gone — but the *class* of bug isn't.
3. **`key` as a state-reset mechanism.** Missed twice in one session.
4. **Biased shuffle** — skipped. `Array.sort` with an inconsistent comparator only compares the pairs
   its algorithm happens to visit, so elements drift near their starting index.

Landed cleanly, don't re-test soon: `useReducer` vs `useState` (after correction — atomicity, not
tidiness), the sync/async storage consequence chain, the bucket A/B/C file classification.
