import { useEffect, useRef, useState } from "react";
import { Word } from "../types";
import { getWords, storeWords } from "../localStore";

export function useWords() {
  const hasLoadedWords = useRef(false);

  const [words, setWords] = useState<Word[]>([]);

  const handleAddWord = (word: Word) => {
    setWords((prev) => [...prev, word]);
  };

  const handleDeleteWord = (id: string) => {
    setWords((prev) => prev.filter((word) => word.id !== id));
  };

  useEffect(() => {
    getWords().then((result) => {
      setWords(result ?? []);
      hasLoadedWords.current = true;
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedWords.current) {
      return;
    }
    storeWords(words);
  }, [words]);

  return { handleAddWord, handleDeleteWord, setWords, words };
}
