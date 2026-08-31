import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter, createMemoryHistory } from "@tanstack/react-router";

import { routeTree } from "../src/routeTree.gen";
import "../src/styles.css";

const queryClient = new QueryClient();

// Capacitor loads index.html from a file:// URL, so start the router in memory
// mode at "/" and let in-app navigation handle everything from there.
const router = createRouter({
  routeTree,
  context: { queryClient },
  scrollRestoration: false,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  history: createMemoryHistory({ initialEntries: ["/"] }),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
