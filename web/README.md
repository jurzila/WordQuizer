# WordQuizer: React web client

This is a rewrite of the [WordQuizer](../README.md) frontend, moving it from React Native (Expo + `react-native-web`) to a plain React web app. It uses the same Express + MongoDB backend as the original.

> **Status: work in progress.** The React Native app on `main` is the complete, deployed version. This branch ports it one screen at a time.

## Why rewrite it?

Two reasons:

- **To go deeper with React and libraries I chose myself.** React Native hides a lot of the web platform. Rewriting the app in plain React means working directly with routing, HTML and CSS, and a dedicated server-state layer, using the libraries I want to get better at.
- **To avoid the overhead of mobile app development.** Publishing a native app brings costs that a web app doesn't have, such as a paid Apple developer account for iOS. A web app runs on any phone's browser, and deploying it is free.

## Progress

| Feature | React Native (`main`) | React (this branch) |
| --- | --- | --- |
| Log in / register, persisted session | ✅ | ✅ |
| Protected routes | ✅ | ✅ |
| Lessons: list, create, rename, delete | ✅ | ✅ |
| Lesson detail: view words | ✅ | ✅ |
| Add / delete words | ✅ | ⏳ |
| Matching quiz | ✅ | ⏳ (reducer ported, UI pending) |
| Flashcards | ✅ | ⏳ (reducer ported, UI pending) |
| Quiz setup (lesson picker, direction, word count) | ✅ | ⏳ |

## Tech stack

| Concern | Choice |
| --- | --- |
| Build | Vite 8, TypeScript |
| UI | React 19 |
| Routing | TanStack Router (file-based routes, code splitting) |
| Server state | TanStack Query 5 |
| Styling | Tailwind CSS v4, with design tokens in `@theme` |
| Testing | Vitest, React Testing Library, `user-event`, jsdom |
| Linting | Oxlint |

## How it's built

- **File-based routing.** Routes live in `src/routes/`, and the TanStack Router Vite plugin generates the typed route tree. A pathless `_authed` layout checks for a token in `beforeLoad` and redirects to `/login` if there isn't one, so every protected page is guarded in one place.
- **TanStack Query owns server data.** Lesson data first lived in route loaders and was refreshed with `router.invalidate()`. That re-runs every matched loader and can't target one piece of data, so it moved to TanStack Query:
  - `src/queries.ts` defines each query (key + fetch function) once. Both loaders and components use that definition.
  - Loaders warm the cache through the `queryClient` passed in router context, and components read it with `useSuspenseQuery`, so the data is never `undefined`.
  - Create, rename and delete are `useMutation`s. Their `onSuccess` returns the `invalidateQueries` promise, so the UI only moves on after the list has refetched.
  - The query cache is cleared on logout, so the next user to log in never sees the previous user's lessons.
- **Typed API errors.** `src/api.ts` throws an `ApiError` that carries the HTTP status. A route can then tell a 404 (render `notFoundComponent`) apart from other failures (render `errorComponent`).
- **Route and page are separate.** Route files handle data loading and wiring. Page components in `src/components/` take plain props, which makes them easy to test on their own. Shared UI pieces (`Button`, `Card`, `TextField`, `EmptyState`, …) live in `src/components/ui/`.
- **Tests target real bugs.** The component tests cover behaviour that has actually gone wrong or easily could: the rename input starting with the current name, the delete flow requiring confirmation, and cancel doing nothing.

### Backend changes made alongside

- New `GET /api/collection/:collectionId` endpoint for the lesson detail route.
- Malformed ObjectIds now return `400` instead of `500` (`parseObjectIdParam` helper plus `CastError` handling).
- The error handler no longer sends internal error messages to the client.
- `ALLOWED_ORIGIN` accepts a comma-separated list, so the old and new frontends can both call the API.

## Project structure

```
web/src/
├── main.tsx              # QueryClient, router, providers
├── routes/               # File-based routes
│   ├── __root.tsx        # Root route with { queryClient } context
│   ├── login.tsx
│   ├── _authed.tsx       # Auth guard layout
│   └── _authed/
│       ├── index.tsx
│       └── lessons/
│           ├── index.tsx           # Lessons list + mutations
│           └── $collectionId.tsx   # Lesson detail
├── components/           # Page components and ui/ building blocks
│   └── __test__/         # Component tests
├── queries.ts            # TanStack Query definitions
├── api.ts                # Typed fetch layer and ApiError
├── context/              # Auth/session context
├── reducers/             # Quiz and flashcard state machines (ported from RN)
└── storage.ts            # Safe localStorage wrappers
```

## Running locally

Start the backend first (see the [main README](../README.md#1-backend)), then:

```bash
cd web
npm install
cp .env.example .env.development
```

Set the API URL in `.env.development`:

```env
VITE_API_URL=http://localhost:3000/api
```

```bash
npm run dev
```

Other scripts:

| Command | Description |
| --- | --- |
| `npm test` | Run the Vitest suite |
| `npm run lint` | Lint with Oxlint |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build locally |

If you run the backend locally with `ALLOWED_ORIGIN` set, add `http://localhost:5173` to it.

## About this project

I've built production React apps at work. This project is where I go deeper on my own terms, using a stack I picked myself: TanStack Router, TanStack Query, Tailwind and React Testing Library. I'm using Claude as a tutor: it explains concepts and reviews my code while I do the implementation.
