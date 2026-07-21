import { createContext, useContext } from "react";
import { Collection, Word } from "../types";
import { useWords } from "../hooks/useWords";
import { useCollections } from "../hooks/useCollections";

export type WordAppContext = {
  words: Word[];
  collections: Collection[];
  handleAddWord: (word: string, translation: string, collectionId: string) => void;
  handleDeleteWord: (id: string) => void;
  handleAddCollection: (name: string) => void;
  handleDeleteCollection: (id: string) => void;
  handleRenameCollection: (id: string, name: string) => void;
};

const WordAppContext = createContext<WordAppContext | null>(null);

export function useWordApp() {
  const context = useContext(WordAppContext);
  if (!context)
    throw new Error("useWordApp must be used within WordAppProvider");
  return context;
}

export function WordAppProvider({ children }: {children: React.ReactNode}) {
      const { words, handleAddWord, handleDeleteWord } = useWords();
      const {
        collections,
        handleAddCollection,
        handleDeleteCollection,
        handleRenameCollection,
      } = useCollections();

      return (
        <WordAppContext.Provider value={{
            words, collections,
            handleAddWord, handleDeleteWord,
            handleAddCollection, handleDeleteCollection, handleRenameCollection
        }}>
            {children}
        </WordAppContext.Provider>
      )
}