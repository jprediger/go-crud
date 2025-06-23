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
  SignInOutput,
  //UpdatePasswordInput,
} from "aws-amplify/auth";

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
  login: (input: SignInInput) => Promise<SignInOutput | void>;
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

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
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

  const login = async (input: SignInInput) => {
    setIsAuthenticating(true);
    setError(null);
    try {
      if (user) {
        await signOut();
        setUser(null);
      }
      const output = await signIn(input);

      checkCurrentUser(); // Atualiza o usuário após login
      
      return output; 

    } catch (err: any) {
      setError(err.message || "Erro ao tentar fazer login.");
      setUser(null);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const confirmSignInHandler = async (challengeResponse: string) => {
    setIsAuthenticating(true);
    setError(null);
    try {
      await confirmSignIn({ challengeResponse });
      // O Hub listener vai pegar o evento "signedIn" e atualizar o usuário.
      // O Router irá redirecionar automaticamente se o usuário estava tentando acessar uma rota protegida.
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
    } catch (err: any) {
      setError(
        err.message || "Erro ao tentar confirmar a redefinição de senha."
      );
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      await signOut();
      setUser(null);

      // O Hub listener vai definir o usuário como null.
      // O Router, ao ver que o usuário não está mais autenticado em uma rota protegida,
      // fará o redirecionamento via beforeLoad.
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
