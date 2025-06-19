// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type FC,
} from "react";

// Configuração do Amplify
import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    },
  },
});

import {
  signIn,
  signOut,
  confirmSignIn,
  getCurrentUser,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";

import type {
  SignInInput,
  //SignUpInput,
  //SignUpOutput,
  //ConfirmSignUpInput,
  //ResendSignUpCodeInput,
  ResetPasswordInput,
  ConfirmResetPasswordInput,
  //UpdatePasswordInput,
} from "aws-amplify/auth";

// Tipos de navegação do React Router
import type { NavigateOptions } from "@tanstack/react-router";

// Tipos
interface AuthUser {
  username: string;
  userId: string;
  signInDetails?: any; 
  userRole?: string | number | true;
  userFilial?: string | number | true;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean; // Verificação inicial de usuário
  isAuthenticating: boolean; // Estado durante login/logout
  error: string | null;
  login: (input: SignInInput) => Promise<void>;
  logout: () => Promise<void>;
  confirmSignInHandler: (
    nextStep: string,
    challengeResponse: string
  ) => Promise<void>;
  resetPasswordHandler: (input: ResetPasswordInput) => Promise<void>;
  confirmResetPasswordHandler: (
    input: ConfirmResetPasswordInput
  ) => Promise<void>;
}

interface AuthProviderProps {
  navigate: (opts: NavigateOptions) => void;
  children: ReactNode;
}

// === Devolve o ID Token JWT ou null ===
export async function getJwtToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || null;
  } catch {
    return null;
  }
}

// === Devolve um objeto com headers já montados ===
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getJwtToken();
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

// === Hook AuthContext ===

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<AuthProviderProps> = ({ navigate, children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Inicializa listener de eventos de Auth via Hub (importado de 'aws-amplify/utils') :contentReference[oaicite:1]{index=1}
    const hubListenerCancel = Hub.listen("auth", (data: any) => {
      const { payload } = data;
      switch (payload.event) {
        case "signedIn":
          checkCurrentUser();
          break;
        case "signedOut":
          setUser(null);
          break;
        case "autoSignIn": // Auto sign-in após confirmação
        case "signInWithRedirect":
          checkCurrentUser();
          break;
        case "autoSignIn_failure":
        case "signInWithRedirect_failure":
          setError("Falha no login automático.");
          setIsLoading(false);
          break;
        // Outros eventos podem ser tratados aqui
      }
    });

    // Verifica usuário já autenticado ao montar o Provider :contentReference[oaicite:2]{index=2}
    checkCurrentUser();

    return () => {
      // Cancela listener ao desmontar
      hubListenerCancel();
    };
  }, []);

  // Checa o usuário atual no início e após eventos de autenticação
  const checkCurrentUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cognitoUser = await getCurrentUser(); // Lança se não houver usuário :contentReference[oaicite:3]{index=3}
      const session = await fetchAuthSession(); // Obtém sessão para verificar se o usuário está autenticado

      const idToken = session.tokens?.idToken?.payload;
      let userRole = undefined;
      let userFilial = undefined;

      if (!idToken) { // Se não houver token, usuário não está autenticado
        throw new Error("Usuário não autenticado.");
      }
      userRole = idToken["custom:role"]; // Obtém o papel do usuário
      userFilial = idToken["custom:filial_name"]; // Obtém a filial do usuário

      if (typeof userRole !== "string") {
        userRole = 'viewer'; // Define um papel padrão se não for string
      }
      if (typeof userFilial !== "string") {
        userFilial = undefined; // Define uma filial padrão se não for string
      }

      setUser({
        username: cognitoUser.username,
        userId: cognitoUser.userId,
        signInDetails: cognitoUser.signInDetails,
        userRole: userRole,
        userFilial: userFilial,
      });
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de login
  const login = async (input: SignInInput) => {
    setIsAuthenticating(true);
    setError(null);
    try {
      if (user) { // Se já estiver autenticado, desloga
        await signOut();
        setUser(null);
      }
      const { isSignedIn, nextStep } = await signIn(input);

      // Navega para tela de dashboard se autenticado
      if (isSignedIn) {
        checkCurrentUser(); // Atualiza o usuário após login
        navigate({
          to: "/",
          replace: true,
        });
      } else if (nextStep?.signInStep) {
        if (
          nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
        ) {
          navigate({
            to: "/auth/confirmar-login",
            replace: true,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "Erro ao tentar fazer login.");
      setUser(null);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const confirmSignInHandler = async (
    nextStep: string,
    challengeResponse: string
  ) => {
    setIsAuthenticating(true);
    setError(null);
    try {
      if (!nextStep || nextStep === "") {
        throw new Error("nextStep não fornecido para confirmação de login.");
      } else if (nextStep === "CONFIRM_SIGN_IN_WITH_PASSWORD") {
        await confirmSignIn({
          challengeResponse: challengeResponse,
        });
        checkCurrentUser();
        navigate({
          to: "/",
          replace: true,
        });
      }
    } catch (err: any) {
      setError(err.message || "Erro ao tentar confirmar login.");
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const resetPasswordHandler = async (
    input: ResetPasswordInput
  ): Promise<void> => {
    setIsAuthenticating(true);
    setError(null);
    try {
      await resetPassword(input);
      // Aqui você pode navegar para uma página de confirmação ou mostrar uma mensagem
    } catch (err: any) {
      setError(err.message || "Erro ao tentar redefinir a senha.");
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const confirmResetPasswordHandler = async (
    input: ConfirmResetPasswordInput
  ): Promise<void> => {
    setIsAuthenticating(true);
    setError(null);
    try {
      await confirmResetPassword(input);
      // Aqui você pode navegar para a página de login ou mostrar uma mensagem
      navigate({
        to: "/auth/login",
        replace: true,
      });
    } catch (err: any) {
      setError(
        err.message || "Erro ao tentar confirmar a redefinição de senha."
      );
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Função de logout
  const logout = async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      await signOut();

      if (!user) {
        navigate({
          to: "/auth/login",
          replace: true,
        });
      }
    } catch (err: any) {
      setError(err.message || "Erro ao tentar fazer logout.");
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticating,
        error,
        login,
        logout,
        confirmSignInHandler,
        resetPasswordHandler,
        confirmResetPasswordHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
