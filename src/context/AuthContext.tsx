import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError, AuthResponse } from '@/lib/api';

interface AuthContextState {
  user: AuthResponse['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextState | null>(null);
const STORAGE_KEY = 'memomed.auth';

const readStoredAuth = () => {
  if (typeof window === 'undefined') return { token: null, user: null };
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { token: null, user: null };
  try {
    const parsed = JSON.parse(raw);
    return {
      token: typeof parsed.token === 'string' ? parsed.token : null,
      user: parsed.user ?? null,
    };
  } catch {
    return { token: null, user: null };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(() => readStoredAuth());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Mark hydration complete on client
    setIsInitializing(false);
  }, []);

  const persist = useCallback((next: { token: string | null; user: AuthResponse['user'] | null }) => {
    setState(next);
    if (typeof window !== 'undefined') {
      if (next.token) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      persist({ token: response.token, user: response.user });
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new Error('Autentificare eșuată');
    }
  }, [persist]);

  const logout = useCallback(() => {
    persist({ token: null, user: null });
  }, [persist]);

  const value = useMemo<AuthContextState>(() => ({
    user: state.user,
    token: state.token,
    isAuthenticated: Boolean(state.token),
    isInitializing,
    login,
    logout,
  }), [state, isInitializing, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
