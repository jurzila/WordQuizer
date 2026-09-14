import type { Word } from "../types";
import { shuffle } from "../utils/shuffle";

type FlashcardState = {
  deck: Word[];
  flagged: Word[];
  current: Word | null;
  isFlipped: boolean;
  known: number;
};

type FlashcardAction =
  | { type: "START_FLASHCARDS"; payload: Word[] }
  | { type: "FLIP" }
  | { type: "GOT_IT" }
  | { type: "FLAG" }
  | { type: "REVIEW_FLAGGED" };

export const initialState: FlashcardState = {
  deck: [],
  flagged: [],
  current: null,
  isFlipped: false,
  known: 0,
};

export function flashcardReducer(
  state: FlashcardState,
  action: FlashcardAction,
): FlashcardState {
  switch (action.type) {
    case "START_FLASHCARDS": {
      const shuffled = shuffle(action.payload);
      const firstWord = shuffled[0];
      return {
        ...initialState,
        current: firstWord,
        deck: shuffled.slice(1),
      };
    }
    case "FLIP":
      return { ...state, isFlipped: !state.isFlipped };
    case "GOT_IT": {
      if (!state.current) return state;
      const currentWord = state.deck[0] ?? null;
      const updatedDeck = state.deck.slice(1);
      return {
        ...state,
        known: state.known + 1,
        current: currentWord,
        deck: updatedDeck,
        isFlipped: false,
      };
    }
    case "FLAG": {
      if (!state.current) return state;
      return {
        ...state,
        flagged: [...state.flagged, state.current],
        current: state.deck[0] ?? null,
        deck: state.deck.slice(1),
        isFlipped: false,
      };
    }
    case "REVIEW_FLAGGED": {
      if (state.flagged.length === 0) return state;
      return {
        ...state,
        deck: state.flagged.slice(1),
        current: state.flagged[0],
        flagged: [],
        isFlipped: false,
        known: 0,
      };
    }
    default:
      return state;
  }
}
