import {
  Outlet,
  createRootRouteWithContext,
  useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import TanStackQueryLayout from "../integrations/tanstack-query/layout.tsx";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
  queryClient: QueryClient;
}

import { AuthProvider } from "@/contexts/AuthContext.tsx"; // ajuste o caminho conforme seu projeto
import { ThemeProvider } from "@/contexts/ThemeContext.tsx";

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => {
    const navigate = useNavigate();
    return (
      <AuthProvider navigate={navigate}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Outlet />
          <TanStackRouterDevtools />
          <TanStackQueryLayout />
        </ThemeProvider>
      </AuthProvider>
    );
  },
});
