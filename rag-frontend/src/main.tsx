import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./contexts/AuthContext";
import * as TanStackQueryProvider from "./integrations/tanstack-query/root-provider.tsx";

// Import the generated route tree

import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";
import { AppRouterProvider } from "./AppRouterProvider.tsx";
import { Toaster } from "sonner";

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AuthProvider>
		<Toaster />
        <TanStackQueryProvider.Provider>
          <AppRouterProvider />
        </TanStackQueryProvider.Provider>
      </AuthProvider>
    </StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
