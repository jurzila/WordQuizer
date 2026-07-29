import { createContext, useContext } from "react";
import { Collection, Word } from "../types";
import { useWords } from "../hooks/useWords";
import { useCollections } from "../hooks/useCollections";
import { useAuth } from "../hooks/useAuth";

export type WordAppContext = {
  words: Word[];
  collections: Collection[];
  token: string | null;
  email: string | null;
  isLoading: boolean;
  handleAddWord: (
    word: string,
    translation: string,
    collectionId: string,
  ) => void;
  handleDeleteWord: (id: string) => void;
  handleAddCollection: (name: string) => void;
  handleDeleteCollection: (id: string) => void;
  handleRenameCollection: (id: string, name: string) => void;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleRegister: (email: string, password: string) => Promise<void>;
  handleLogout: () => void;
};

const WordAppContext = createContext<WordAppContext | null>(null);

export function useWordApp() {
  const context = useContext(WordAppContext);
  if (!context)
    throw new Error("useWordApp must be used within WordAppProvider");
  return context;
}

export function WordAppProvider({ children }: { children: React.ReactNode }) {
  const { token, email, isLoading, handleLogin, handleRegister, handleLogout } =
    useAuth();
  const { words, handleAddWord, handleDeleteWord } = useWords(token);
  const {
    collections,
    handleAddCollection,
    handleDeleteCollection,
    handleRenameCollection,
  } = useCollections(token);

  return (
    <WordAppContext.Provider
      value={{
        words,
        collections,
        handleAddWord,
        handleDeleteWord,
        handleAddCollection,
        handleDeleteCollection,
        handleRenameCollection,
        token,
        email,
        isLoading,
        handleLogin,
        handleRegister,
        handleLogout,
      }}
    >
      {children}
    </WordAppContext.Provider>
  );
}
