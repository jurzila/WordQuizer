import { createContext, useContext, useState } from "react";
import type { Collection, Word } from "../types";
import { useWords } from "../hooks/useWords";
import { useCollections } from "../hooks/useCollections";
import { useAuth } from "../hooks/useAuth";

export type WordAppContext = {
  words: Word[];
  collections: Collection[];
  token: string | null;
  email: string | null;
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
  loading: boolean;
  error: string | null;
};

const WordAppContext = createContext<WordAppContext | null>(null);

export function useWordApp() {
  const context = useContext(WordAppContext);
  if (!context)
    throw new Error("useWordApp must be used within WordAppProvider");
  return context;
}

export function WordAppProvider({ children }: { children: React.ReactNode }) {
  const { token, email, handleLogin, handleRegister, handleLogout } =
    useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { words, handleAddWord, handleDeleteWord } = useWords(
    token,
    setLoading,
    setError,
  );
  const {
    collections,
    handleAddCollection,
    handleDeleteCollection,
    handleRenameCollection,
  } = useCollections(token, setLoading, setError);

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
        handleLogin,
        handleRegister,
        handleLogout,
        loading,
        error,
      }}
    >
      {children}
    </WordAppContext.Provider>
  );
}
