import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useWordApp } from "../../context/WordAppContext";

export const Route = createFileRoute("/_authed/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { email, handleLogout } = useWordApp();

  const logout = () => {
    handleLogout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <p className="mb-6 text-2xl text-primary">{email}</p>
      <button
        className="py-3.5 rounded-xl border border-danger-border text-md text-danger"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}
