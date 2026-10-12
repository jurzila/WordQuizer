import { useState } from "react";
import { useWordApp } from "../context/WordAppContext";
import { useNavigate } from "@tanstack/react-router";
import Button from "./ui/Button";
import TextField from "./ui/TextField";
import ErrorMessage from "./ui/ErrorMessage";

export default function LoginPage() {
  const navigate = useNavigate();
  const { handleLogin, handleRegister } = useWordApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    try {
      if (isRegistering) {
        await handleRegister(email.trim(), password.trim());
      } else {
        await handleLogin(email.trim(), password.trim());
      }
      setEmail("");
      setPassword("");
      navigate({ to: "/" });
    } catch (e) {
      console.error(e);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-100">
        <h1 className="text-2xl font-semibold text-text-primary mb-1">
          WordQuizer
        </h1>
        <p className="text-md text-text-muted mb-6">
          {isRegistering ? "Create an account" : "Welcome back"}
        </p>

        <form onSubmit={handleSubmit}>
          <TextField
            id="email"
            label="Email"
            type="email"
            className="w-full"
            value={email}
            autoComplete="email"
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="example@email.com"
          />

          <div className="mt-4">
            <TextField
              id="password"
              label="Password"
              type="password"
              className="w-full"
              value={password}
              autoComplete={isRegistering ? "new-password" : "current-password"}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="password"
            />
          </div>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit" className="w-full mt-5">
            {isRegistering ? "Create account" : "Sign in"}
          </Button>

          <button
            type="button"
            className="w-full mt-4 text-center text-sm text-text-muted"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
          >
            {isRegistering
              ? "Already have an account? "
              : "Don't have an account? "}
            <span className="text-primary font-semibold">
              {isRegistering ? "Sign in" : "Register"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
