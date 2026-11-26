"use client";

import PageShell from "@/components/PageShell";
import { useLanguage } from "@/lib/language";
import { useSession } from "@/lib/session-context";
import { useLocalProgress } from "@/lib/guest";

export default function CareerPage() {
  const { t } = useLanguage();
  const { user } = useSession();
  const progress = useLocalProgress();
  const hasData = progress.missionsCompleted > 0;

  return (
    <PageShell title={t.career.heading}>
      {!hasData && !user ? <p className="page-note">{t.career.noData}</p> : null}

      {hasData ? (
        <section className="panel">
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
        </section>
      ) : null}
    </PageShell>
  );
}
