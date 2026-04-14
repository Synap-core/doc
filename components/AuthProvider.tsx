'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSession, logout as cpLogout, redirectToLogin, User } from '@/lib/cp-auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  login: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  logout: async () => {},
  login: () => {},
  refreshSession: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const IS_DEV = process.env.NODE_ENV === 'development';

  const refreshSession = async () => {
    try {
      const session = await getSession();
      setUser(session?.user || null);
    } catch (error) {
      console.error('Failed to refresh session:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    // In development, auto-authenticate
    if (IS_DEV) {
      setUser({
        id: 'dev-user',
        email: 'dev@synap.local',
        name: 'Developer',
        role: 'admin',
      });
      setIsLoading(false);
      return;
    }

    // Initial session check
    refreshSession().finally(() => {
      setIsLoading(false);
    });

    // Listen for auth state changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'synap-auth-change') {
        refreshSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = () => {
    redirectToLogin();
  };

  const handleLogout = async () => {
    await cpLogout();
    setUser(null);
    // Notify other tabs about logout
    localStorage.setItem('synap-auth-change', Date.now().toString());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout: handleLogout,
        login: handleLogin,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
