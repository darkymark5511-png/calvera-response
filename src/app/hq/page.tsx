"use client";

import PageShell from "@/components/PageShell";
import { useLanguage } from "@/lib/language";
import { useSession } from "@/lib/session-context";
import { useLocalProgress } from "@/lib/guest";

export default function Headquarters() {
  const { t } = useLanguage();
  const { user } = useSession();
  const progress = useLocalProgress();

  return (
    <PageShell title={t.hq.heading}>
      <p className="page-note">
        {user ? t.hq.signedInNotice : t.hq.guestNotice}
      </p>

      <section className="panel">
        <h2 className="panel-title">{t.hq.progressHeading}</h2>
        {progress.missionsCompleted > 0 ? (
          <dl className="stat-list">
            <div className="stat-row">
              <dt>{t.career.nextMission}</dt>
              <dd>{progress.missionsCompleted + 1}</dd>
            </div>
            <div className="stat-row">
              <dt>{t.career.funds}</dt>
              <dd>{progress.funds} CR</dd>
            </div>
          </dl>
        ) : (
          <p className="page-note">{t.hq.progressEmpty}</p>
        )}
      </section>
    </PageShell>
  );
}
