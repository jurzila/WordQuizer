import { useEffect, useState } from "react";
import { login, register, setToken } from "../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    const data = await login(email, password);
    setTokenState(data.token);
    setEmail(data.email);
    setToken(data.token);
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("email", data.email);
  };

  const handleRegister = async (email: string, password: string) => {
    const data = await register(email, password);
    setTokenState(data.token);
    setEmail(data.email);
    setToken(data.token);
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("email", data.email);
  };

  const handleLogout = async () => {
    setTokenState("");
    setToken("");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("email");
    setEmail(null);
  };

  useEffect(() => {
    Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('email')
    ]).then(([storedToken, storedEmail]) => {
        if (storedToken) {
            setTokenState(storedToken)
            setToken(storedToken)
        }
        if (storedEmail) setEmail(storedEmail)
        setIsLoading(false)
    })
}, [])

  return { token, email, isLoading, handleLogin, handleRegister, handleLogout };
}
