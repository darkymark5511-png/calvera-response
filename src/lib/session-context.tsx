"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface SessionUser {
  id: string;
  username: string;
  displayName: string | null;
  role: string;
}

export type ServerStatus = "checking" | "online" | "offline";

interface SessionState {
  user: SessionUser | null;
  serverStatus: ServerStatus;
}

interface SessionContextValue extends SessionState {
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const INITIAL: SessionState = { user: null, serverStatus: "checking" };

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>(INITIAL);

  // State is set from inside the async continuation, never synchronously in
  // the effect body.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [me, health] = await Promise.allSettled([
        fetch("/api/auth/me", { cache: "no-store" }).then(async (res) => {
          if (!res.ok) return null;
          const body = (await res.json()) as { user?: SessionUser | null };
          return body.user ?? null;
        }),
        fetch("/api/health", { cache: "no-store" }).then((res) => res.ok),
      ]);
      if (cancelled) return;
      setState({
        user: me.status === "fulfilled" ? me.value : null,
        serverStatus:
          health.status === "fulfilled" && health.value ? "online" : "offline",
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    const [me, health] = await Promise.allSettled([
      fetch("/api/auth/me", { cache: "no-store" }).then(async (res) => {
        if (!res.ok) return null;
        const body = (await res.json()) as { user?: SessionUser | null };
        return body.user ?? null;
      }),
      fetch("/api/health", { cache: "no-store" }).then((res) => res.ok),
    ]);
    setState({
      user: me.status === "fulfilled" ? me.value : null,
      serverStatus:
        health.status === "fulfilled" && health.value ? "online" : "offline",
    });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Even if the call fails, drop the local view of the session.
    }
    setState((prev) => ({ ...prev, user: null }));
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ ...state, refresh, signOut }),
    [state, refresh, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
