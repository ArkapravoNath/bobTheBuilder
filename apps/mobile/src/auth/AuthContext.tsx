import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { User } from '@bob/shared-schemas';

const TOKEN_KEY = 'buildbuddy_auth_token';
const USER_KEY = 'buildbuddy_auth_user';

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:4000';

export type DevLoginProfile = 'designer' | 'onboarding';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestReset: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  /** Dev-only: instantly authenticates without the mock API. */
  devLogin: (profile?: DevLoginProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEV_USERS: Record<DevLoginProfile, User> = {
  designer: {
    id: 'dev-user-001',
    email: 'dev@buildbuddy.app',
    displayName: 'Dev Designer',
    onboardingComplete: true,
    archetype: 'full_house',
    location: 'Mumbai',
    createdAt: '2026-01-01T00:00:00.000Z',
  } as unknown as User,
  onboarding: {
    id: 'dev-user-002',
    email: 'onboarding@buildbuddy.app',
    displayName: 'Dev Onboarding',
    onboardingComplete: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  } as unknown as User,
};

function canUseBrowserStorage() {
  return Platform.OS === 'web' && typeof window !== 'undefined' && !!window.localStorage;
}

async function getStoredItem(key: string) {
  if (canUseBrowserStorage()) {
    return window.localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setStoredItem(key: string, value: string) {
  if (canUseBrowserStorage()) {
    window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteStoredItem(key: string) {
  if (canUseBrowserStorage()) {
    window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

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
        getStoredItem(TOKEN_KEY),
        getStoredItem(USER_KEY),
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
      setStoredItem(TOKEN_KEY, t),
      setStoredItem(USER_KEY, JSON.stringify(u)),
    ]);
    setToken(t);
    setUser(u);
  }

  async function clearSession() {
    await Promise.all([
      deleteStoredItem(TOKEN_KEY),
      deleteStoredItem(USER_KEY),
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

  async function devLogin(profile: DevLoginProfile = 'designer') {
    await persistSession(`dev-token-local-${profile}`, DEV_USERS[profile]);
  }

  async function refreshUser() {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/v1/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { data } = (await res.json()) as { data: User };
        await setStoredItem(USER_KEY, JSON.stringify(data));
        setUser(data);
      }
    } catch {
      // network error — keep stale user
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut, requestReset, refreshUser, devLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
