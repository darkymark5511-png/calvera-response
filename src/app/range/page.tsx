"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import { useLanguage } from "@/lib/language";
import { translator } from "@/i18n/lookup";
import { AWARENESS } from "@/game/ai/awareness";
import {
  MATERIALS,
  resolvePenetration,
  type CaliberClass,
  type MaterialId,
} from "@/game/combat/penetration";
import { COMMANDS } from "@/game/commands/radial";
import { createRange, fire, issueRangeCommand, SMOKE_SECONDS, stepRange, type RangeState } from "@/game/world/range";

/** Fixed simulation tick so the range behaves the same at any frame rate. */
const TICK_SECONDS = 0.1;
const CALIBERS: readonly CaliberClass[] = ["556", "762", "308", "9mm", "12-gauge", "non-lethal"];
const WALL_LAYERS: readonly MaterialId[] = ["drywall", "plywood"];

function Meter({ value, label }: { value: number; label: string }) {
  const clamped = Math.round(Math.min(100, Math.max(0, value)));
  return (
    <div className="meter">
      <div className="meter-head">
        <span className="meter-label">{label}</span>
        <span className="meter-value">{clamped}</span>
      </div>
      <div
        className="meter-track"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      >
        <div className="meter-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export default function RangePage() {
  const { t } = useLanguage();
  const translate = useMemo(() => translator(t), [t]);
  const [state, setState] = useState<RangeState>(() => createRange());
  const [running, setRunning] = useState(false);
  const [caliber, setCaliber] = useState<CaliberClass>("556");

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setState((current) => stepRange(current, TICK_SECONDS));
    }, TICK_SECONDS * 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const toggleLight = useCallback(() => {
    setState((current) => ({
      ...current,
      player: { ...current.player, lightOn: !current.player.lightOn },
    }));
  }, []);

  const toggleNightVision = useCallback(() => {
    setState((current) => ({
      ...current,
      player: { ...current.player, nightVision: !current.player.nightVision },
    }));
  }, []);

  const toggleSmoke = useCallback(() => {
    setState((current) => ({
      ...current,
      smokeSeconds: current.smokeSeconds > 0 ? 0 : SMOKE_SECONDS,
    }));
  }, []);

  const onFire = useCallback(() => {
    setState((current) => fire(current).state);
  }, []);

  const onOrder = useCallback((slot: number) => {
    setState((current) => issueRangeCommand(current, slot));
  }, []);

  const onReset = useCallback(() => {
    setState(createRange());
    setRunning(false);
  }, []);

  const penetration = useMemo(
    () => resolvePenetration({ baseDamage: 34, caliber, materials: WALL_LAYERS }),
    [caliber],
  );

  const suspect = state.suspect;

  return (
    <PageShell title={t.range.heading}>
      <p className="page-note">{t.range.subtitle}</p>

      <section className="panel">
        <h2 className="panel-title">{t.range.suspectLabel}</h2>
        <Meter value={suspect.awareness} label={t.range.awareness} />
        <dl className="stat-list">
          <div className="stat-row">
            <dt>{t.range.awareness}</dt>
            <dd>{t.range.state[suspect.state]}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.range.moodHeading}</dt>
            <dd>{t.range.mood[suspect.mood]}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.range.health}</dt>
            <dd>{Math.round(suspect.health)}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.range.roomLight}</dt>
            <dd>{state.roomLight.toFixed(2)}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.range.smokeLeft}</dt>
            <dd>{state.smokeSeconds.toFixed(1)}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.range.violations}</dt>
            <dd>{state.violations}</dd>
          </div>
        </dl>
        <p className="page-note range-threshold">
          {[AWARENESS.suspiciousEnter, AWARENESS.alertedEnter, AWARENESS.combatEnter].join(" / ")}
        </p>
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.range.squadHeading}</h2>
        <dl className="stat-list">
          {state.squad.map((member) => (
            <div className="stat-row" key={member.operatorId}>
              <dt>{member.callsign}</dt>
              <dd>{t.range.task[member.task]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.range.ordersHeading}</h2>
        <div className="order-grid">
          {COMMANDS.map((command, index) => (
            <button
              key={command.id}
              id={`order-${command.id}`}
              type="button"
              className="order-button"
              onClick={() => onOrder(index)}
            >
              {translate(command.labelKey)}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.range.feedHeading}</h2>
        {state.feed.length === 0 ? (
          <p className="page-note">{t.range.feedEmpty}</p>
        ) : (
          <ul className="feed-list">
            {state.feed.map((event) => (
              <li className="feed-line" key={event.id}>
                <span className="feed-callsign">{event.callsign}</span>
                <span className="feed-text">{translate(event.textKey, event.values)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.range.controlsHeading}</h2>
        <div className="order-grid">
          <button
            type="button"
            className="order-button"
            onClick={() => setRunning((current) => !current)}
          >
            {running ? t.range.reset : t.range.entry}
          </button>
          <button type="button" className="order-button" onClick={toggleLight}>
            {state.player.lightOn ? t.range.lightOn : t.range.lightOff}
          </button>
          <button type="button" className="order-button" onClick={toggleNightVision}>
            {state.player.nightVision ? t.range.nightVisionOn : t.range.nightVisionOff}
          </button>
          <button type="button" className="order-button" onClick={toggleSmoke}>
            {state.smokeSeconds > 0 ? t.range.smokeOff : t.range.smokeOn}
          </button>
          <button type="button" className="order-button" onClick={onFire}>
            {t.range.fire}
          </button>
          <button type="button" className="order-button" onClick={onReset}>
            {t.range.reset}
          </button>
        </div>
        {state.alerts.length > 0 ? (
          <ul className="feed-list">
            {state.alerts.map((key) => (
              <li className="feed-line" key={key}>
                <span className="feed-text">{translate(key)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="page-note">{t.range.noViolations}</p>
        )}
        <p className="page-note">{`${t.range.secondsOnRange}: ${state.seconds.toFixed(1)}`}</p>
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.range.penHeading}</h2>
        <p className="page-note">{t.range.penNote}</p>
        <div className="choice-row">
          {CALIBERS.map((option) => (
            <button
              key={option}
              type="button"
              className={`choice-button${caliber === option ? " is-active" : ""}`}
              aria-pressed={caliber === option}
              onClick={() => setCaliber(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <dl className="stat-list">
          <div className="stat-row">
            <dt>{t.range.caliber}</dt>
            <dd>{caliber}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.range.damage}</dt>
            <dd>{penetration.damage}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.range.stopped}</dt>
            <dd>
              {penetration.stoppedBy
                ? translate(MATERIALS[penetration.stoppedBy].labelKey)
                : t.range.noViolations}
            </dd>
          </div>
          {WALL_LAYERS.map((layer) => (
            <div className="stat-row" key={layer}>
              <dt>{translate(MATERIALS[layer].labelKey)}</dt>
              <dd>{`${Math.round(MATERIALS[layer].retention * 100)}%`}</dd>
            </div>
          ))}
        </dl>
      </section>
    </PageShell>
  );
}
