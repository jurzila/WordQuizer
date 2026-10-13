import { useState } from "react";
import { login, register } from "../api";
import {
  clearStored,
  EMAIL_KEY,
  readStored,
  TOKEN_KEY,
  writeStored,
} from "../storage";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(() =>
    readStored(TOKEN_KEY),
  );
  const [email, setEmail] = useState<string | null>(() =>
    readStored(EMAIL_KEY),
  );
  const queryClient = useQueryClient();

  const handleLogin = async (email: string, password: string) => {
    const data = await login(email, password);
    setTokenState(data.token);
    setEmail(data.email);
    writeStored(TOKEN_KEY, data.token);
    writeStored(EMAIL_KEY, data.email);
  };

  const handleRegister = async (email: string, password: string) => {
    const data = await register(email, password);
    setTokenState(data.token);
    setEmail(data.email);
    writeStored(TOKEN_KEY, data.token);
    writeStored(EMAIL_KEY, data.email);
  };

  const handleLogout = () => {
    setTokenState(null);
    clearStored(TOKEN_KEY);
    clearStored(EMAIL_KEY);
    setEmail(null);
    queryClient.clear();
  };

  return { token, email, handleLogin, handleRegister, handleLogout };
}
