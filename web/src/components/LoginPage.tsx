import { useState } from "react";
import { useWordApp } from "../context/WordAppContext";
import { useNavigate } from "@tanstack/react-router";

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
        setEmail("");
        setPassword("");
        navigate({ to: "/" });
      } else {
        await handleLogin(email.trim(), password.trim());
        setEmail("");
        setPassword("");
        navigate({ to: "/" });
      }
    } catch (e) {
      console.error(e);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-100">
        <h1 className="text-[28px] font-semibold text-text-primary mb-1">
          WordQuizer
        </h1>
        <p className="text-md text-text-muted mb-6">
          {isRegistering ? "Create an account" : "Welcome back"}
        </p>

        <form onSubmit={handleSubmit}>
          <label
            className="block text-sm font-medium text-text-secondary mb-1.5"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="w-full border border-borderInput rounded-md py-2.5 px-3 text-base bg-surface focus:border-primary focus:outline-none"
            value={email}
            autoComplete="email"
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="example@email.com"
            type="email"
            id="email"
          />

          <label
            className="block text-sm font-medium text-text-secondary mb-1.5 mt-4"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="w-full border border-borderInput rounded-md py-2.5 px-3 text-base bg-surface focus:border-primary focus:outline-none"
            value={password}
            autoComplete="current-password"
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            placeholder="password"
            type="password"
            id="password"
          />

          {error && (
            <div className="bg-danger-bg border border-danger-border rounded-lg p-3 mt-3">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <button
            className="w-full bg-primary py-2.5 px-4 rounded-md text-surface font-semibold text-md mt-5"
            type="submit"
          >
            {isRegistering ? "Create account" : "Sign in"}
          </button>

          <button
            className="w-full mt-4 text-center text-sm text-text-muted"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            type="button"
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
