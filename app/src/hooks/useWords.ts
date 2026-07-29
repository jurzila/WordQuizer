import { useEffect, useState } from "react";
import { Word } from "../types";
import { createWord, deleteWord, getWords } from "../api";

export function useWords(
  token: string | null,
  setLoading: (v: boolean) => void,
  setError: (v: string | null) => void,
) {
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    getWords(token)
      .then(setWords)
      .catch(() => setError("Failed to load words"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAddWord = async (
    word: string,
    translation: string,
    collectionId: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const newWord = await createWord(word, translation, collectionId);
      setWords((prev) => [...prev, newWord]);
    } catch {
      setError("Failed to add a word");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWord = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteWord(id);
      setWords((prev) => prev.filter((word) => word._id !== id));
    } catch {
      setError("Failed to delete a word");
    } finally {
      setLoading(false);
    }
  };

  return { handleAddWord, handleDeleteWord, words };
}
