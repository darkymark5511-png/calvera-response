"use client";

import { useState } from "react";
import PageShell from "@/components/PageShell";
import { useLanguage } from "@/lib/language";
import { useSession } from "@/lib/session-context";
import { leaveGuestMode } from "@/lib/guest";

type Mode = "login" | "register";

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user, refresh, signOut, serverStatus } = useSession();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setOkMessage(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      if (!res.ok) {
        setMessage(body?.error?.message ?? t.common.genericError);
        return;
      }
      setPassword("");
      if (mode === "register") {
        setMode("login");
        setOkMessage(t.profile.signIn);
      } else {
        leaveGuestMode();
        await refresh();
      }
    } catch {
      setMessage(serverStatus === "offline" ? t.common.offline : t.common.genericError);
    } finally {
      setBusy(false);
    }
  }

  if (user) {
    return (
      <PageShell title={t.profile.heading}>
        <section className="panel">
          <p className="page-note">
            {t.profile.signedInAs} <strong>{user.username}</strong>
          </p>
          <button
            type="button"
            className="menu-button"
            onClick={() => void signOut()}
          >
            <span className="menu-button-label">{t.profile.signOut}</span>
          </button>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell title={t.profile.heading}>
      <p className="page-note">{t.profile.optionalNote}</p>

      <section className="panel">
        <h2 className="panel-title">
          {mode === "login" ? t.profile.signIn : t.profile.createAccount}
        </h2>

        {message ? <p className="form-error">{message}</p> : null}
        {okMessage ? <p className="form-ok">{okMessage}</p> : null}

        <form onSubmit={submit} className="form">
          <label className="field-label" htmlFor="username">
            {t.profile.username}
          </label>
          <input
            id="username"
            className="field-input"
            value={username}
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
          />
          <label className="field-label" htmlFor="password">
            {t.profile.password}
          </label>
          <input
            id="password"
            className="field-input"
            type="password"
            value={password}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            onChange={(event) => setPassword(event.target.value)}
          />
          <div className="form-actions">
            <button type="submit" className="menu-button" disabled={busy}>
              <span className="menu-button-label">
                {mode === "login" ? t.profile.signIn : t.profile.createAccount}
              </span>
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setMessage(null);
                setOkMessage(null);
              }}
            >
              {mode === "login" ? t.profile.needAccount : t.profile.haveAccount}
            </button>
          </div>
        </form>
      </section>
    </PageShell>
  );
}
