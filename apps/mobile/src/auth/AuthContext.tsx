import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@bob/shared-schemas';

const TOKEN_KEY = 'buildbuddy_auth_token';
const USER_KEY = 'buildbuddy_auth_user';

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:4000';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestReset: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      }
    } catch {
      // corrupt storage — clear it
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  }

  async function persistSession(t: string, u: User) {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, t),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(u)),
    ]);
    setToken(t);
    setUser(u);
  }

  async function clearSession() {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setToken(null);
    setUser(null);
  }

  async function signIn(email: string, _password: string) {
    const res = await fetch(`${API_BASE}/v1/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: _password }),
    });
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      throw new Error(err.error ?? 'Sign-in failed');
    }
    const { token: t, user: u } = (await res.json()) as { token: string; user: User };
    await persistSession(t, u);
  }

  // Sign-up is identical to sign-in in the mock (any email is accepted)
  async function signUp(email: string, password: string, displayName?: string) {
    await signIn(email, password);
    // If displayName provided, patch the user object locally
    if (displayName && user) {
      setUser((prev) => (prev ? { ...prev, displayName } : prev));
    }
  }

  async function signOut() {
    await clearSession();
  }

  async function requestReset(_email: string) {
    // Mock: pretend an email was sent
    await new Promise((r) => setTimeout(r, 600));
  }

  async function refreshUser() {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/v1/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { data } = (await res.json()) as { data: User };
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data));
        setUser(data);
      }
    } catch {
      // network error — keep stale user
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut, requestReset, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
