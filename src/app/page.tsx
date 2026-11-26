"use client";

import { useCallback, useEffect, useState } from "react";

interface Me {
  id: string;
  username: string;
  displayName: string | null;
  role: string;
}

type Health = { status: string; database: string };

export default function Home() {
  const [me, setMe] = useState<Me | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const body = await res.json();
      setMe(body.user ?? null);
    } catch {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [meRes, healthRes] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" })
          .then((res) => res.json())
          .catch(() => ({ user: null })),
        fetch("/api/health", { cache: "no-store" })
          .then((res) => res.json())
          .catch(() => ({ status: "error", database: "unavailable" })),
      ]);
      if (cancelled) return;
      setMe(meRes.user ?? null);
      setHealth(healthRes);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(body?.error?.message ?? "Something went wrong.");
        return;
      }
      setPassword("");
      setMessage(mode === "register" ? "Account created. You can sign in now." : null);
      if (mode === "register") {
        setMode("login");
      } else {
        await refreshMe();
      }
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
  }

  const dbDown = health?.status !== "ok";

  return (
    <main>
      <h1>Calvera Response</h1>
      <p className="sub">Calvera Bay Tactical Response Unit</p>

      <div className="card">
        <h2>Server status</h2>
        {health ? (
          <p className="note">
            Database:{" "}
            <span className={dbDown ? "error" : "ok"}>
              {health.database === "connected" ? "connected" : "unavailable"}
            </span>
            {dbDown
              ? " — accounts are offline. You can still play as a guest; progress stays on this device."
              : null}
          </p>
        ) : (
          <p className="note">Checking…</p>
        )}
      </div>

      {me ? (
        <div className="card">
          <h2>Signed in</h2>
          <p className="note">
            {me.username}
            {me.role === "admin" ? " — administrator" : ""}
          </p>
          <div className="row" style={{ marginTop: 14 }}>
            <button type="button" onClick={() => void logout()}>
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2>{mode === "login" ? "Sign in" : "Create account"}</h2>
          {message ? <p className="error">{message}</p> : null}
          <form onSubmit={submit}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="row">
              <button type="submit" disabled={busy}>
                {mode === "login" ? "Sign in" : "Create account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setMessage(null);
                }}
              >
                {mode === "login" ? "Need an account?" : "Have an account?"}
              </button>
            </div>
          </form>
          <p className="note">
            Guests can play offline. Only signed-in accounts sync progress and
            scores to the server. / Tamu dapat bermain offline. Hanya akun yang
            masuk yang menyinkronkan progres dan skor ke server.
          </p>
        </div>
      )}
    </main>
  );
}
