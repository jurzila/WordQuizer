import { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth";

export type WordAppContext = {
  token: string | null;
  email: string | null;
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
  const { token, email, handleLogin, handleRegister, handleLogout } =
    useAuth();

  return (
    <WordAppContext.Provider
      value={{
        token,
        email,
        handleLogin,
        handleRegister,
        handleLogout,
      }}
    >
      {children}
    </WordAppContext.Provider>
  );
}
