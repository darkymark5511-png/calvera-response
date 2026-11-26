"use client";

import { useCallback, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import { useLanguage } from "@/lib/language";
import { updateCareer, useCareer } from "@/lib/guest";
import { translator } from "@/i18n/lookup";
import { applyMissionResult } from "@/game/hq/progress";
import { MISSION_PAYOUTS, formatFunds, payoutForRank, type MissionRank } from "@/game/economy/funds";

const MISSION_RANKS: readonly MissionRank[] = ["flawless", "clean", "acceptable", "messy"];

export default function CareerPage() {
  const { t } = useLanguage();
  const translate = useMemo(() => translator(t), [t]);
  const career = useCareer();
  const [notice, setNotice] = useState<string | null>(null);

  const dispatch = useCallback(() => {
    const missionIndex = career.missionsCompleted + 1;
    const rank: MissionRank = missionIndex % 2 === 0 ? "clean" : "acceptable";
    const payout = payoutForRank(rank);
    updateCareer((current) =>
      applyMissionResult(current, {
        missionIndex,
        rank,
        payout,
        leadEntries: 0,
        now: new Date().toISOString(),
      }),
    );
    setNotice(`${translate("career.missionRow", { index: missionIndex })}: ${formatFunds(payout)}`);
  }, [career.missionsCompleted, translate]);

  const rows = Object.entries(career.bestRanks).sort(
    ([a], [b]) => Number(a) - Number(b),
  );

  return (
    <PageShell title={t.career.heading}>
      {career.missionsCompleted === 0 ? (
        <p className="page-note">{t.career.noData}</p>
      ) : null}

      <section className="panel">
        <dl className="stat-list">
          <div className="stat-row">
            <dt>{t.career.nextMission}</dt>
            <dd>{career.missionsCompleted + 1}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.career.missionsCompleted}</dt>
            <dd>{career.missionsCompleted}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.career.funds}</dt>
            <dd>{formatFunds(career.funds)}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.career.leadEntries}</dt>
            <dd>{career.leadEntries}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.career.payoutHeading}</h2>
        <dl className="stat-list">
          {MISSION_RANKS.map((rank) => (
            <div className="stat-row" key={rank}>
              <dt>{t.career.rank[rank]}</dt>
              <dd>{formatFunds(MISSION_PAYOUTS[rank])}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.career.bestRank}</h2>
        {rows.length === 0 ? (
          <p className="page-note">{t.career.none}</p>
        ) : (
          <dl className="stat-list">
            {rows.map(([index, rank]) => (
              <div className="stat-row" key={index}>
                <dt>{translate("career.missionRow", { index })}</dt>
                <dd>{rank}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.career.dispatchHeading}</h2>
        <p className="page-note">{t.career.dispatchNote}</p>
        <button type="button" className="order-button" onClick={dispatch}>
          {t.career.dispatch}
        </button>
        {notice ? <p className="page-note form-ok">{notice}</p> : null}
      </section>
    </PageShell>
  );
}
