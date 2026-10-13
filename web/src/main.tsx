import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { WordAppProvider } from "./context/WordAppContext.tsx";
import { QueryClient, QueryClientProvider,  } from "@tanstack/react-query";

const queryClient = new QueryClient()
const router = createRouter({ routeTree, context: {queryClient} });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WordAppProvider>
        <RouterProvider router={router} />
      </WordAppProvider>
    </QueryClientProvider>
  </StrictMode>,
);
