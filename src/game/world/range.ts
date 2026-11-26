import type { Vec2 } from "../ai/types";
import { createSuspect, tickSuspect, type TickInput } from "../ai/suspect";
import {
  createSquad,
  reportLightBeam,
  suppressionPenalty,
  type SquadMemberState,
  type SubtitleEvent,
} from "../ai/squad";
import { evaluateLethalShot, type RoeMode, type RoeVerdict } from "../combat/roe";
import { COMMANDS, preferredOperator, resolveAcknowledgement } from "../commands/radial";
import { distance } from "../perception/visibility";

/**
 * The training range is a single corridor room with one suspect. It exists so
 * the Phase 2 systems (awareness, squad, commands, rules of engagement) can be
 * driven and watched before the mission generator arrives. The state is plain
 * data and every transition is a pure function, which keeps it testable.
 */

export interface RangePlayerState {
  position: Vec2;
  /** Weapon light is switched on. */
  lightOn: boolean;
  nightVision: boolean;
}

export interface RangeState {
  seconds: number;
  suspect: ReturnType<typeof createSuspect>;
  squad: SquadMemberState[];
  player: RangePlayerState;
  roomLight: number;
  smokeSeconds: number;
  roeMode: RoeMode;
  lastVerdict: RoeVerdict | null;
  violations: number;
  feed: SubtitleEvent[];
  alerts: string[];
}

export const RANGE_SUSPECT_POSITION: Vec2 = { x: 7, y: 0.2 };
export const RANGE_PLAYER_POSITION: Vec2 = { x: 0.5, y: 0 };
export const RANGE_ROOM_LIGHT = 0.55;
export const LIGHT_BEAM_RANGE_METERS = 20;
export const SMOKE_SECONDS = 20;

export const RANGE_SQUAD_IDS = ["op-okafor", "op-whitfield", "op-ellery"] as const;

export function createRange(): RangeState {
  return {
    seconds: 0,
    suspect: createSuspect("suspect-range", RANGE_SUSPECT_POSITION, "range", Math.PI),
    squad: createSquad(RANGE_SQUAD_IDS),
    player: {
      position: RANGE_PLAYER_POSITION,
      lightOn: false,
      nightVision: false,
    },
    roomLight: RANGE_ROOM_LIGHT,
    smokeSeconds: 0,
    roeMode: "restrained",
    lastVerdict: null,
    violations: 0,
    feed: [],
    alerts: [],
  };
}

/** True when the player's laser dot touches the suspect's body outline. */
export function laserOnBody(state: RangeState): boolean {
  const target = state.suspect.position;
  return distance(state.player.position, target) <= LIGHT_BEAM_RANGE_METERS;
}

export function lightBeamVisible(state: RangeState): boolean {
  return state.player.lightOn && laserOnBody(state);
}

function pushAlert(alerts: readonly string[], key: string): string[] {
  const next = alerts.includes(key) ? [...alerts] : [...alerts, key];
  return next.slice(-4);
}

/** Advances the range by a fixed tick. Pure: returns a new state. */
export function stepRange(state: RangeState, seconds: number): RangeState {
  const dt = Math.max(0, seconds);
  if (dt === 0) return state;

  const smokeSeconds = Math.max(0, state.smokeSeconds - dt);

  const input: TickInput = {
    seconds: dt,
    room: { id: "range", lightLevel: state.roomLight, gasLevel: 0, smokeSeconds },
    smokeBlocks: smokeSeconds > 0,
    observerHasNightVision: false,
    laserOnBody: laserOnBody(state) && (state.player.lightOn || state.suspect.state !== "idle"),
    lightBeamVisible: lightBeamVisible(state),
    sightBlockedByWall: false,
    playerPosition: state.player.position,
  };

  const suspect = tickSuspect(state.suspect, input);
  const penalty = suppressionPenalty(
    state.squad.map((member) => ({
      ...member,
      injuryDays: 0,
      suppressionTarget: member.suppressionTarget,
    })),
    suspect.id,
  );

  const suppressed = penalty > 0 ? { ...suspect, suppression: penalty } : suspect;

  const report = reportLightBeam(
    state.squad,
    state.player.position,
    distance(state.player.position, suspect.position),
    true,
  );

  const feed =
    report && !state.feed.some((event) => event.id === report.id)
      ? [...state.feed, report].slice(-5)
      : state.feed;

  return {
    ...state,
    seconds: state.seconds + dt,
    suspect: suppressed,
    smokeSeconds,
    feed,
  };
}

export interface RangeActionResult {
  state: RangeState;
  verdict: RoeVerdict | null;
}

/** Applies a lethal shot and records any rules-of-engagement violation. */
export function fire(state: RangeState): RangeActionResult {
  const posture =
    state.suspect.state === "combat" || state.suspect.state === "alerted"
      ? "engaged"
      : state.suspect.state === "suspicious"
        ? "armed"
        : "unaware";

  const verdict = evaluateLethalShot({
    mode: state.roeMode,
    posture,
    positiveId: posture !== "unaware",
    collateralRisk: false,
  });

  const violations = verdict.outcome === "violation" ? state.violations + 1 : state.violations;

  return {
    verdict,
    state: {
      ...state,
      lastVerdict: verdict,
      violations,
      alerts: pushAlert(state.alerts, verdict.messageKey),
      suspect:
        verdict.outcome === "allowed"
          ? { ...state.suspect, health: Math.max(0, state.suspect.health - 45) }
          : state.suspect,
    },
  };
}

/**
 * Issues one of the eight radial orders. The answer comes back as a subtitle,
 * the same channel the light-beam report uses.
 */
export function issueRangeCommand(state: RangeState, wheelSlot: number): RangeState {
  const command = COMMANDS[((wheelSlot % COMMANDS.length) + COMMANDS.length) % COMMANDS.length];
  if (!command) return state;

  const target = preferredOperator(
    command.id,
    state.squad.map((member) => member.operatorId),
  );
  if (!target) return state;

  const ack = resolveAcknowledgement(
    {
      commandId: command.id,
      targetCallsign: target.callsign,
      issuedAtSeconds: state.seconds,
      radioAvailable: true,
    },
    state.squad.map((member) => member.operatorId),
  );

  const event: SubtitleEvent = {
    id: `cmd-${command.id}-${Math.round(state.seconds * 10)}`,
    callsign: ack.callsign,
    textKey: ack.confirmed ? ack.ackKey : (ack.refusalKey ?? "cmd.ack.none"),
    values: { callsign: ack.callsign },
  };

  const task =
    command.id === "hold-fire" || command.id === "hold"
      ? "holding"
      : command.id === "stack-up"
        ? "stacking"
        : command.id === "breach"
          ? "breaching"
          : command.id === "cover-me"
            ? "covering"
            : command.id === "search"
              ? "searching"
              : "moving";

  return {
    ...state,
    squad: state.squad.map((member) =>
      member.operatorId === target.id ? { ...member, task } : member,
    ),
    feed: [...state.feed, event].slice(-5),
  };
}
