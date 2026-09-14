# WordQuizer — Project Summary

## Overview
WordQuizer is a full-stack word learning application built as a web app (mobile browser optimised). Users can create lessons, add word pairs (e.g. Lithuanian → English), and practice with matching quizzes and flashcards. The app is fully deployed with user authentication.

---

## Tech Stack

### Frontend
- **React Native** with **Expo** (web export via `react-native-web`)
- **TypeScript**
- **React Navigation** — bottom tabs + native stack navigators
- **AsyncStorage** — token persistence only
- **Animated API** (built-in React Native) — wrong-match animation in quiz

### Backend
- **Node.js** + **TypeScript**
- **Express** — REST API
- **Mongoose** — MongoDB ODM
- **MongoDB Atlas** — cloud database (free tier)
- **JWT** (`jsonwebtoken`) — authentication
- **bcryptjs** — password hashing

### Deployment
- **Frontend** → Netlify (auto-deploy on merge to main)
- **Backend** → Render (auto-deploy on merge to main)
- **Database** → MongoDB Atlas

---

## Project Structure

```
WordQuizer/
├── app/                          # Expo frontend
│   ├── App.tsx                   # Entry point, auth gate, navigation
│   ├── src/
│   │   ├── api.ts                # All fetch functions (typed)
│   │   ├── types.ts              # Word, Collection types (_id based)
│   │   ├── context/
│   │   │   └── WordAppContext.tsx # Global context + provider
│   │   ├── hooks/
│   │   │   ├── useAuth.ts        # Token, login, register, logout
│   │   │   ├── useWords.ts       # Words state + API calls
│   │   │   └── useCollections.ts # Collections state + API calls
│   │   ├── reducers/
│   │   │   ├── quizReducer.ts    # Quiz state machine
│   │   │   └── flashcardsReducer.ts # Flashcard state machine
│   │   ├── navigation/
│   │   │   ├── types.ts          # Stack param lists
│   │   │   ├── LessonsNavigator.tsx
│   │   │   └── QuizNavigator.tsx
│   │   ├── screens/
│   │   │   ├── AuthScreen.tsx
│   │   │   ├── LessonsScreen.tsx
│   │   │   ├── LessonDetailScreen.tsx
│   │   │   ├── AddWordScreen.tsx
│   │   │   ├── QuizSetupScreen.tsx
│   │   │   ├── QuizScreen.tsx
│   │   │   ├── FlashcardScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── components/
│   │   │   ├── QuizCard.tsx      # Animated quiz card
│   │   │   └── GlobalFeedback.tsx # Loading + error banner
│   │   └── theme/
│   │       ├── colors.ts
│   │       ├── spacing.ts
│   │       └── sharedStyles.ts
│   └── .env                      # EXPO_PUBLIC_API_URL
│
├── backend/                      # Express backend
│   ├── src/
│   │   ├── index.ts              # Entry point
│   │   ├── app.ts                # Express setup, middleware, routes
│   │   ├── config/
│   │   │   └── db.ts             # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Word.ts
│   │   │   └── Collection.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── wordController.ts
│   │   │   └── collectionController.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── word.ts
│   │   │   └── collection.ts
│   │   ├── middleware/
│   │   │   └── auth.ts           # JWT verification middleware
│   │   └── types/
│   │       └── express.d.ts      # AuthRequest type extension
│   ├── .env                      # MONGODB_URI, JWT_SECRET, PORT
│   ├── railway.json
│   └── package.json
│
└── web/                          # Future pure React rewrite (Vite + Tailwind v4 + TanStack Router)
```

---

## Data Models

### User
```typescript
{
    email: string        // unique, lowercase, trimmed
    password: string     // bcrypt hashed
    timestamps: true
}
```

### Collection
```typescript
{
    name: string
    userId: ObjectId     // ref: User
    timestamps: true
}
```

### Word
```typescript
{
    word: string
    translation: string
    collectionId: ObjectId  // ref: Collection
    userId: ObjectId        // ref: User
    timestamps: true
}
```

---

## Frontend Types

```typescript
export type Word = {
    _id: string
    word: string
    translation: string
    collectionId: string
}

export type Collection = {
    _id: string
    name: string
}
```

---

## API Endpoints

All routes except auth require `Authorization: Bearer <token>` header.

### Auth
```
POST /api/auth/register   { email, password } → { token, email }
POST /api/auth/login      { email, password } → { token, email }
```

### Collections (scoped to userId)
```
GET    /api/collection              → Collection[]
POST   /api/collection              { name } → Collection
PUT    /api/collection/:id          { name } → Collection
DELETE /api/collection/:id          → { message, wordsDeleted }
```

### Words (scoped to userId)
```
GET    /api/word                    → Word[]
GET    /api/word/collection/:id     → Word[]
POST   /api/word                    { word, translation, collectionId } → Word
DELETE /api/word/:id                → 204
GET    /api/word/quiz?collectionIds → Word[] (30 random via $sample)
```

---

## Authentication Flow

```
Register/Login → backend returns JWT token
Frontend stores token in AsyncStorage
useAuth restores token on app load
api.ts module variable holds token for all requests
Every API call sends Authorization: Bearer <token>
Backend authMiddleware verifies token, extracts userId
All controllers filter data by userId
```

---

## Navigation Structure

```
App.tsx
└── WordAppProvider
    └── AppNavigator
        ├── AuthScreen (when no token)
        └── NavigationContainer (when token exists)
            ├── Tab: Lessons
            │   └── LessonsNavigator (stack)
            │       ├── LessonsScreen
            │       ├── LessonDetailScreen
            │       └── AddWordScreen
            ├── Tab: Quiz
            │   └── QuizNavigator (stack)
            │       ├── QuizSetupScreen
            │       ├── QuizScreen
            │       └── FlashcardScreen
            └── Tab: Profile
                └── ProfileScreen
```

---

## State Management

### Context (WordAppContext)
Provides globally:
- `words`, `collections` — data arrays
- `token`, `email`, `isLoading` — auth state
- `loading`, `error` — global API feedback
- All handlers: `handleAddWord`, `handleDeleteWord`, `handleAddCollection`, `handleDeleteCollection`, `handleRenameCollection`, `handleLogin`, `handleRegister`, `handleLogout`

### useReducer — Quiz (quizReducer)
```typescript
type QuizState = {
    wordPool: Word[]
    quizWords: Word[]        // visible (max 5)
    translations: Word[]
    selectedWord: Word | null
    matched: string[]
    wrong: string | null
    isAnimating: boolean
}

// Actions: START_QUIZ, SELECT_WORD, CORRECT_MATCH, WRONG_MATCH, RESHUFFLE, WRONG_ANIMATION_COMPLETE
```

### useReducer — Flashcards (flashcardReducer)
```typescript
type FlashcardState = {
    deck: Word[]
    flagged: Word[]
    current: Word | null
    isFlipped: boolean
    known: number
}

// Actions: START_FLASHCARDS, FLIP, GOT_IT, FLAG, REVIEW_FLAGGED
```

---

## Key Features

### Lessons
- Create, rename, delete lessons (collections)
- Cascade delete — deleting a lesson deletes all its words
- Inline rename with toggle UI
- Empty state handling

### Words
- Add words to a specific lesson
- Delete words
- Words scoped per user and per lesson

### Matching Quiz
- Conveyor belt — new word appears immediately on correct match
- 5 cards visible at a time, pool feeds in as matches happen
- Wrong match: animated red flash (React Native Animated API)
- Correct match: green flash before reshuffle
- Multi-collection selection
- Custom word count (minimum 20) or all words
- Progress bar showing completed/total
- isAnimating guard prevents input during animation

### Flashcards
- Two modes: Word→Translation or Translation→Word
- Tap to flip card
- Got it / Flag buttons after flip
- Flagged cards reviewed after main deck exhausted
- Progress bar
- End screen with score breakdown

### Quiz Setup
- Multi-collection selector with checkboxes
- Flashcard direction toggle
- Word count selector (All / Custom with validation)
- Mode selection flows to correct screen

---

## Shared Theme System

```
src/theme/
├── colors.ts      — palette (primary, danger, surface, text, border, quiz colors)
├── spacing.ts     — spacing scale (xs, sm, md, lg, xl, xxl), radius, fontSize
└── sharedStyles.ts — reusable StyleSheet objects (card, button, input, list, emptyState, quizCard)
```

Screens import from `sharedStyles` and only define local styles for screen-specific layout.

---

## Animations

**Wrong match flash** (`QuizCard.tsx`):
- `Animated.Value` via `useRef`
- `Animated.sequence` — instant to red (duration 0) then fade back to blue (600ms)
- `interpolate` maps 0→1 to `#9ad1e6`→`#c9181e`
- `AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)`
- `onWrongAnimationComplete` callback resets parent state after animation

---

## Environment Variables

### Frontend (`app/.env`)
```
EXPO_PUBLIC_API_URL=https://your-render-url.onrender.com/api
```

### Backend (`backend/.env`)
```
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
ALLOWED_ORIGIN=https://your-netlify-app.netlify.app
```

---

## Planned Next Steps

### In Progress
- CORS fix for Render/Netlify production
- Vite + React + Tailwind v4 + TanStack Router rewrite (`web/` folder)

### Rewrite Plan (`web/`)
- Vite + React + TypeScript
- Tailwind CSS v4
- TanStack Router (replacing React Navigation)
- `localStorage` (replacing AsyncStorage)
- Standard HTML elements (replacing React Native components)
- All hooks, reducers, context, api.ts carry over unchanged

### Future Features
- Word edit functionality
- Statistics tracking (quiz success rate per word)
- Flashcard flip animation (3D card flip)
- Pagination for large word lists
- Spaced repetition for flagged flashcards

---

## Key Lessons Learned

- `useReducer` vs `useState` — when multiple state pieces move together
- Race conditions with async loading and React effects
- JWT auth flow end to end
- MongoDB `_id` vs frontend UUID — transformation at API boundary
- Fisher-Yates shuffle vs biased `sort(() => Math.random())`
- React Native Animated API for smooth transitions
- Expo web deployment quirks vs standard React
- Monorepo structure for full stack projects
- Per-user data scoping with JWT middleware
- Global error/loading state via context
