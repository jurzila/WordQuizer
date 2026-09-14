import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { readStored, TOKEN_KEY } from "../storage";

export const Route = createFileRoute("/_authed")({
  beforeLoad: () => {
    if (!readStored(TOKEN_KEY)) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  return <Outlet />;
}
