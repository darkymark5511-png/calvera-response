"use client";

import Link from "next/link";
import PageShell from "@/components/PageShell";
import { useLanguage } from "@/lib/language";
import { useSession } from "@/lib/session-context";
import { useCareer } from "@/lib/guest";
import { CATALOG } from "@/game/equipment/catalog";
import { formatFunds } from "@/game/economy/funds";

/** Headquarters. The landing point after PLAY AS GUEST, and after sign-in. */
export default function Headquarters() {
  const { t } = useLanguage();
  const { user } = useSession();
  const career = useCareer();

  const kit = Object.values(career.loadout)
    .filter((id): id is string => Boolean(id))
    .map((id) => CATALOG.find((item) => item.id === id))
    .filter((item): item is (typeof CATALOG)[number] => item !== undefined);

  return (
    <PageShell title={t.console.heading}>
      <p className="page-note">{t.console.subtitle}</p>
      <p className="page-note">{user ? t.console.syncedNote : t.console.guestNote}</p>

      <section className="panel">
        <h2 className="panel-title">{t.console.careerHeading}</h2>
        <dl className="stat-list">
          <div className="stat-row">
            <dt>{t.console.nextMission}</dt>
            <dd>{career.missionsCompleted + 1}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.console.missionsCompleted}</dt>
            <dd>{career.missionsCompleted}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.console.funds}</dt>
            <dd>{formatFunds(career.funds)}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.console.leadEntries}</dt>
            <dd>{career.leadEntries}</dd>
          </div>
        </dl>
        <Link className="back-link" href="/career">
          {t.console.careerLink}
        </Link>
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.console.kitHeading}</h2>
        {kit.length === 0 ? (
          <p className="page-note">{t.console.kitEmpty}</p>
        ) : (
          <dl className="stat-list">
            {kit.map((item) => (
              <div className="stat-row" key={item.id}>
                <dt>{item.manufacturer}</dt>
                <dd>{item.name}</dd>
              </div>
            ))}
          </dl>
        )}
        <Link className="back-link" href="/armory">
          {t.console.armoryLink}
        </Link>
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.console.rosterHeading}</h2>
        <div className="link-stack">
          <Link className="back-link" href="/roster">
            {t.console.rosterLink}
          </Link>
          <Link className="back-link" href="/range">
            {t.console.rangeLink}
          </Link>
          <Link className="back-link" href="/leaderboard">
            {t.console.leaderboardLink}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
