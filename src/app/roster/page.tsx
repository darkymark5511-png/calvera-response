"use client";

import { useCallback, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import { useLanguage } from "@/lib/language";
import { translator } from "@/i18n/lookup";
import { ROSTER, SQUAD_SIZE, type Operator } from "@/shared/roster";

const ROLE_KEY = {
  breacher: "breacher",
  "point-man": "pointMan",
  marksman: "marksman",
  medic: "medic",
  technician: "technician",
  negotiator: "negotiator",
  "support-gunner": "supportGunner",
  scout: "scout",
} as const satisfies Record<Operator["role"], string>;
import {
  DEFAULT_SQUAD,
  entryOrder,
  isMissionReady,
  selectionFromIds,
  toggleMember,
  type SquadSelection,
} from "@/shared/squad-selection";

export default function RosterPage() {
  const { t } = useLanguage();
  const translate = useMemo(() => translator(t), [t]);
  const [selection, setSelection] = useState<SquadSelection>(() => selectionFromIds(DEFAULT_SQUAD));
  const injured = useMemo<readonly string[]>(() => [], []);

  const onToggle = useCallback(
    (id: string) => setSelection((current) => toggleMember(current, id, injured)),
    [injured],
  );

  const ordered = entryOrder(selection);

  return (
    <PageShell title={t.roster.heading}>
      <p className="page-note">{translate("roster.select")}</p>

      <section className="panel">
        <h2 className="panel-title">{t.roster.heading}</h2>
        <ul className="roster-list">
          {ROSTER.map((operator) => {
            const selected = selection.members.includes(operator.id);
            const order = ordered.findIndex((entry) => entry.id === operator.id);
            return (
              <li className="roster-card" key={operator.id}>
                <button
                  id={`roster-${operator.id}`}
                  type="button"
                  className={`roster-button${selected ? " is-selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => onToggle(operator.id)}
                >
                  <span className="roster-head">
                    <span className="roster-callsign">{operator.callsign}</span>
                    {selected ? (
                      <span className="catalog-badge">
                        {`${t.roster.selected} ${order + 1}`}
                      </span>
                    ) : null}
                  </span>
                  <span className="roster-name">{operator.fullName}</span>
                  <span className="roster-role">{t.roster.role[ROLE_KEY[operator.role]]}</span>
                </button>
                <dl className="stat-list roster-stats">
                  <div className="stat-row">
                    <dt>{t.roster.level}</dt>
                    <dd>{`${operator.level} / ${operator.maxLevel}`}</dd>
                  </div>
                  <div className="stat-row">
                    <dt>{t.roster.accuracy}</dt>
                    <dd>{operator.stats.accuracy}</dd>
                  </div>
                  <div className="stat-row">
                    <dt>{t.roster.composure}</dt>
                    <dd>{operator.stats.composure}</dd>
                  </div>
                  <div className="stat-row">
                    <dt>{t.roster.speed}</dt>
                    <dd>{operator.stats.speed}</dd>
                  </div>
                  <div className="stat-row">
                    <dt>{t.roster.durability}</dt>
                    <dd>{operator.stats.durability}</dd>
                  </div>
                  <div className="stat-row">
                    <dt>{translate(operator.abilityKey)}</dt>
                    <dd>{translate(operator.abilityDescriptionKey)}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.cmd.wheel}</h2>
        <dl className="stat-list">
          <div className="stat-row">
            <dt>{t.roster.select}</dt>
            <dd>{`${selection.members.length} / ${SQUAD_SIZE}`}</dd>
          </div>
          {ordered.map((operator, index) => (
            <div className="stat-row" key={operator.id}>
              <dt>{`${index + 1}`}</dt>
              <dd>{operator.callsign}</dd>
            </div>
          ))}
        </dl>
        {isMissionReady(selection, injured) ? null : (
          <p className="page-note form-error">{t.roster.injured}</p>
        )}
      </section>
    </PageShell>
  );
}
