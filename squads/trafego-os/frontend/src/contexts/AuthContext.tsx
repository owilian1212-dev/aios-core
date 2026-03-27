// ============================================================================
// Trafego OS — Auth Context
// Manages authentication state, user role, and permissions
// ============================================================================

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { User, UserRole } from "@/lib/types";
import { authService } from "@/services";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string) => void;
  isAdmin: boolean;
  isGestor: boolean;
  isCliente: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  // Restaurar sessão ao montar component
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = authService.getToken();
        if (token && authService.isTokenValid()) {
          // Token ainda é válido, buscar dados do usuário
          const user = await authService.getCurrentUser();
          setState({ isAuthenticated: true, user, isLoading: false });
        } else {
          // Token expirado ou não existe
          setState({ isAuthenticated: false, user: null, isLoading: false });
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        setState({ isAuthenticated: false, user: null, isLoading: false });
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const { token, user } = await authService.login(email, password);
      authService.setToken(token);
      sessionStorage.setItem("user", JSON.stringify(user));
      setState({ isAuthenticated: true, user, isLoading: false });
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setState(s => ({ ...s, isLoading: false }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("trafego_os_selected_empresa");
      setState({ isAuthenticated: false, user: null, isLoading: false });
    }
  }, []);

  const switchUser = useCallback((_userId: string) => {
    // TODO: Implementar troca de usuário se suportado pela API
    console.warn("switchUser not implemented yet");
  }, []);

  const isAdmin = state.user?.role === "admin";
  const isGestor = state.user?.role === "gestor" || isAdmin;
  const isCliente = state.user?.role === "cliente";

  const hasRole = useCallback((roles: UserRole[]) => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  }, [state.user]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, switchUser, isAdmin, isGestor, isCliente, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
