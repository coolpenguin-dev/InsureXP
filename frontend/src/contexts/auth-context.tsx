"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SESSION_EXPIRED_EVENT } from "@/lib/auth-events";
import { apiFetch } from "@/lib/api";
import {
  clearSession,
  readSession,
  writeSession,
  type StoredCashier,
  type StoredHospital,
  type StoredSession,
} from "@/lib/auth-storage";

type LoginResponse = {
  access_token: string;
  cashier: StoredCashier;
  hospital: StoredHospital | null;
};

type AuthContextValue = {
  ready: boolean;
  token: string | null;
  cashier: StoredCashier | null;
  hospital: StoredHospital | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(null);

  useEffect(() => {
    setSession(readSession());
    setReady(true);
  }, []);

  useEffect(() => {
    function onExpired() {
      clearSession();
      setSession(null);
      const path = window.location.pathname;
      if (path !== "/login" && !path.startsWith("/login")) {
        window.location.assign(`/login?returnTo=${encodeURIComponent(path + window.location.search)}`);
      }
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<LoginResponse>("/auth/login", {
      auth: false,
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const next: StoredSession = {
      accessToken: data.access_token,
      cashier: data.cashier,
      hospital: data.hospital,
    };
    writeSession(next);
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      token: session?.accessToken ?? null,
      cashier: session?.cashier ?? null,
      hospital: session?.hospital ?? null,
      login,
      logout,
    }),
    [ready, session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
