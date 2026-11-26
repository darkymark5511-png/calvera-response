"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import MenuList, { type MenuItem } from "@/components/MenuList";
import { useLanguage } from "@/lib/language";
import { useSession } from "@/lib/session-context";
import { enterGuestMode, useGuestMode, useLocalProgress } from "@/lib/guest";
import { buildSha } from "@/lib/build-sha";

export default function MainMenu() {
  const router = useRouter();
  const { t, lang, setLang } = useLanguage();
  const { user, serverStatus } = useSession();
  const guest = useGuestMode();
  const progress = useLocalProgress();

  const careerDetail =
    progress.missionsCompleted > 0
      ? `${t.career.nextMission} ${progress.missionsCompleted + 1} · ${progress.funds} CR`
      : undefined;

  const items = useMemo<MenuItem[]>(() => {
    const playAsGuest = () => {
      enterGuestMode();
      router.push("/hq");
    };
    return [
      { id: "menu-play-as-guest", label: t.menu.playAsGuest, onSelect: playAsGuest },
      {
        id: "menu-sign-in",
        label: t.menu.signIn,
        onSelect: () => router.push("/profile"),
      },
      {
        id: "menu-career",
        label: t.menu.career,
        detail: careerDetail,
        onSelect: () => router.push("/career"),
      },
      { id: "menu-armory", label: t.menu.armory, onSelect: () => router.push("/armory") },
      {
        id: "menu-settings",
        label: t.menu.settings,
        onSelect: () => router.push("/settings"),
      },
      {
        id: "menu-leaderboard",
        label: t.menu.leaderboard,
        onSelect: () => router.push("/leaderboard"),
      },
    ];
  }, [t, careerDetail, router]);

  const statusText =
    serverStatus === "online"
      ? t.status.dbOnline
      : serverStatus === "offline"
        ? t.status.dbOffline
        : null;

  return (
    <main className="menu">
      <div className="menu-top">
        <div className="menu-lang" role="group" aria-label={t.language.label}>
          <button
            type="button"
            className={`lang-button${lang === "en" ? " is-active" : ""}`}
            aria-pressed={lang === "en"}
            onClick={() => setLang("en")}
          >
            {t.language.en}
          </button>
          <span className="lang-sep" aria-hidden="true">
            /
          </span>
          <button
            type="button"
            className={`lang-button${lang === "id" ? " is-active" : ""}`}
            aria-pressed={lang === "id"}
            onClick={() => setLang("id")}
          >
            {t.language.id}
          </button>
        </div>

        <div className="menu-status" aria-live="polite">
          {statusText ? (
            <span
              className={`status-line ${
                serverStatus === "online" ? "status-online" : "status-offline"
              }`}
            >
              {statusText}
            </span>
          ) : null}
          {serverStatus === "offline" ? (
            <span className="status-offline-note">{t.status.offlineNotice}</span>
          ) : null}
        </div>
      </div>

      <div className="menu-body">
        <div className="menu-column">
          <div className="menu-title-block">
            <h1 className="menu-title">{t.title}</h1>
            <p className="menu-subtitle">{t.subtitle}</p>
          </div>

          <MenuList items={items} ariaLabel={t.title} className="menu-list" />

          <div className="menu-meta">
            {user ? (
              <p className="menu-meta-line">
                {t.profile.signedInAs} {user.username}
              </p>
            ) : guest ? (
              <p className="menu-meta-line">{t.hq.guestNotice}</p>
            ) : null}
            <Link className="menu-meta-link" href="/profile">
              {t.profile.heading}
            </Link>
          </div>
        </div>
      </div>

      <div className="menu-bottom">
        <span className="build-string">
          {t.build} {buildSha()}
        </span>
      </div>
    </main>
  );
}
