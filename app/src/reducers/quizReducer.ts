import { Word } from "../types";
import { shuffle } from "../utils/shuffle";

type QuizState = {
  wordPool: Word[];
  quizWords: Word[];
  translations: Word[];
  selectedWord: Word | null;
  matched: string[];
  wrong: string | null;
  isAnimating: boolean;
};

type QuizAction =
  | { type: "START_QUIZ"; payload: Word[] }
  | { type: "SELECT_WORD"; payload: Word }
  | { type: "CORRECT_MATCH"; payload: Word }
  | { type: "WRONG_MATCH"; payload: Word }
  | { type: "RESHUFFLE" }
  | { type: "WRONG_ANIMATION_COMPLETE" };

export const initialState: QuizState = {
  wordPool: [],
  quizWords: [],
  translations: [],
  selectedWord: null,
  matched: [],
  wrong: null,
  isAnimating: false,
};

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "START_QUIZ": {
      const shuffled = shuffle(action.payload);
      const picked = shuffled.slice(0, 5);
      return {
        wordPool: shuffled.slice(5),
        quizWords: picked,
        translations: shuffle(picked),
        selectedWord: null,
        matched: [],
        wrong: null,
        isAnimating: false,
      };
    }
    case "SELECT_WORD":
      return { ...state, selectedWord: action.payload };
    case "WRONG_MATCH": {
      return {
        ...state,
        wrong: action.payload._id,
        isAnimating: true,
      };
    }
    case "CORRECT_MATCH": {
      const nextWord = state.wordPool[0];
      const updatedPool = state.wordPool.slice(1);
      const updatedQuizWords = [
        ...state.quizWords.filter((w) => w._id !== action.payload._id),
        ...(nextWord ? [nextWord] : []),
      ];
      const updatedTranslations = [
        ...state.translations.filter((w) => w._id !== action.payload._id),
        ...(nextWord ? [nextWord] : []),
      ];
      return {
        ...state,
        matched: [...state.matched, action.payload._id],
        quizWords: updatedQuizWords,
        translations: updatedTranslations,
        wordPool: updatedPool,
        selectedWord: null,
        wrong: null,
        isAnimating: false,
      };
    }
    case "RESHUFFLE":
      return { ...state, translations: shuffle(state.quizWords) };
    case "WRONG_ANIMATION_COMPLETE":
      return { ...state, wrong: null, isAnimating: false };
    default:
      return state;
  }
}
