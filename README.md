# WordQuizer

A full-stack vocabulary trainer. You group word pairs (for example Norwegian → English) into lessons, then practise them with a matching quiz or flashcards. Each user has an account, and their lessons are stored in MongoDB behind a REST API.

The frontend is written in **React Native (Expo)** and runs in the browser through `react-native-web`. The backend is **Node.js + Express + MongoDB**, written in TypeScript.

> **Live demo:** https://classy-starburst-88d95e.netlify.app/
>
> A plain React rewrite (Vite, TanStack Router and Query, Tailwind) is in progress on the [`feature/migration-to-react`](https://github.com/jurzila/WordQuizer/tree/feature/migration-to-react) branch.

---

## Features

- **Accounts.** Register and log in with email and password. Passwords are hashed with bcrypt, and sessions use a JWT that expires after 7 days. The token is kept in AsyncStorage, so you stay logged in after a reload.
- **Lessons.** Create, rename and delete lessons. Deleting a lesson also deletes its words, and the backend handles that cascade.
- **Words.** Add word/translation pairs to a lesson and delete them. The Add Word screen stays open after you save, so you can enter a list of words quickly.
- **Matching quiz.** Pick one or more lessons, then match each word to its translation. A wrong match plays a shake animation. A progress bar tracks how far through the set you are.
- **Flashcards.** Choose the direction (word → translation or translation → word). Flag the cards you got wrong, then go through only the flagged ones again.
- **Word count.** Quiz the whole selection, or set a custom number of words (minimum 20).
- **Loading and errors.** A shared wrapper shows a loading indicator and an error banner for API calls.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React Native 0.81, Expo SDK 54, React 19, TypeScript |
| Navigation | React Navigation 7 (bottom tabs with a native stack in each tab) |
| State | React Context with custom hooks; `useReducer` state machines for the quiz and flashcards |
| Animation | React Native `Animated` API |
| Backend | Node.js 20+, Express 5, TypeScript |
| Database | MongoDB Atlas via Mongoose |
| Auth | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| Hosting | Frontend on Netlify, API on Render, database on MongoDB Atlas |

## Project structure

```
WordQuizer/
├── app/                      # Expo / React Native frontend
│   ├── App.tsx               # Auth gate and tab navigation
│   └── src/
│       ├── api.ts            # Typed fetch functions for every endpoint
│       ├── context/          # WordAppContext: app-wide state and actions
│       ├── hooks/            # useAuth, useWords, useCollections
│       ├── reducers/         # quizReducer, flashcardsReducer
│       ├── navigation/       # Lessons and Quiz stack navigators
│       ├── screens/          # Auth, Lessons, LessonDetails, AddWord,
│       │                     # QuizSetup, Quiz, Flashcard, Profile
│       ├── components/       # QuizCard (animated), GlobalFeedback
│       └── theme/            # Colours, spacing, shared styles
└── backend/                  # Express REST API
    └── src/
        ├── app.ts            # Middleware, CORS, routes, error handler
        ├── config/db.ts      # MongoDB connection
        ├── models/           # User, Collection, Word
        ├── controllers/      # auth, collection, word
        ├── routes/
        └── middleware/auth.ts  # JWT verification
```

## Design decisions

- **Reducers for the quiz and flashcards.** A quiz has several values that change together: the current selection, matched pairs, the wrong-match animation, reshuffling and progress. With separate `useState` calls these could drift out of sync. Each screen instead uses a reducer with explicit actions (`SELECT_WORD`, `CORRECT_MATCH`, `WRONG_MATCH`, `RESHUFFLE`, and so on), so every state change happens in one place.
- **The server is the source of truth.** The app first stored data in AsyncStorage on the device. When the backend was added, the hooks switched to API calls and AsyncStorage now keeps only the auth token. MongoDB generates the IDs, so the client-side UUID generation was removed.
- **Data is scoped to its owner.** Every word and collection query filters by the `userId` taken from the verified JWT. A user can't read or change another user's data by guessing an ID.
- **Quiz words are sampled on the server.** `GET /api/word/quiz` uses MongoDB's `$sample` stage, so the client never has to download a whole lesson just to pick a random set.

## API

All routes except `/api/auth/*` and `/health` need an `Authorization: Bearer <token>` header.

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account and return `{ token, email }` |
| POST | `/api/auth/login` | Log in and return `{ token, email }` |
| GET | `/api/collection` | List the user's lessons |
| POST | `/api/collection` | Create a lesson |
| PUT | `/api/collection/:collectionId` | Rename a lesson |
| DELETE | `/api/collection/:collectionId` | Delete a lesson and its words |
| GET | `/api/word` | List all of the user's words |
| GET | `/api/word/collection/:collectionId` | List the words in one lesson |
| GET | `/api/word/quiz?collectionIds=…` | Random sample of words from the selected lessons |
| POST | `/api/word` | Add a word to a lesson |
| DELETE | `/api/word/:id` | Delete a word |
| GET | `/health` | Health check |

## Running locally

**You need:** Node.js 20+, a MongoDB database (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works), and the Expo Go app on your phone if you want to run it on a device.

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/wordquizer
JWT_SECRET=<any long random string>
# Optional: restrict CORS to your frontend's origin (defaults to *)
ALLOWED_ORIGIN=http://localhost:8081
```

```bash
npm run dev
```

The API runs at `http://localhost:3000`.

### 2. Frontend

```bash
cd app
npm install
```

Create `app/.env` and point it at the API. On a physical device, use your computer's LAN IP address instead of `localhost`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

```bash
npm run web
```

Use `npm start` instead to get a QR code that opens the app in Expo Go.

## What I learned

This is a learning project. I built it to learn React Native and the Node/MongoDB stack, with Claude as a tutor: it explained concepts and reviewed my code while I did the implementation. The project grew in stages: first a local-only React Native app, then I moved its state into reducers, then added an Express and MongoDB backend, and finally added authentication and deployment. Along the way I worked with React Navigation's nested navigators, `useReducer` for UI state machines, the React Native `Animated` API, designing a REST API, JWT authentication, and deploying the frontend and backend separately with environment-based configuration.

The next step is a rewrite of the frontend in plain React with a router and a server-state library. It is on the `feature/migration-to-react` branch.
