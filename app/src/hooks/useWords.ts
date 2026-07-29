import { useEffect, useState } from "react";
import { Word } from "../types";
import { createWord, deleteWord, getWords } from "../api";

export function useWords(token: string | null) {
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    if (!token) return;
    getWords(token).then(setWords);
  }, [token]);

  const handleAddWord = async (
    word: string,
    translation: string,
    collectionId: string,
  ) => {
    const newWord = await createWord(word, translation, collectionId);
    setWords((prev) => [...prev, newWord]);
  };

  const handleDeleteWord = async (id: string) => {
    await deleteWord(id);
    setWords((prev) => prev.filter((word) => word._id !== id));
  };

  return { handleAddWord, handleDeleteWord, words };
}
