import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import TanStackQueryLayout from "../integrations/tanstack-query/layout.tsx";

import type { QueryClient } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext.tsx"; // ajuste o caminho conforme seu projeto

interface MyRouterContext {
  queryClient: QueryClient;
  auth: ReturnType<typeof useAuth>;
}
import { ThemeProvider } from "@/contexts/ThemeContext.tsx";

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Outlet />
        <TanStackRouterDevtools />
        <TanStackQueryLayout />
      </ThemeProvider>
    );
  },
});
