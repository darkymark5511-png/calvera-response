import { ROSTER, SQUAD_SIZE, type Operator } from "@/shared/roster";
import type { Vec2 } from "./types";

/**
 * Squad brain. Every member is bound to a roster entry, so the squad cannot
 * carry a temporary callsign. The brain only tracks behaviour and the subtitles
 * that the HUD renders.
 */

export type SquadTask =
  | "holding"
  | "moving"
  | "stacking"
  | "breaching"
  | "covering"
  | "flashing"
  | "searching"
  | "treating"
  | "reporting";

export interface SquadMemberState {
  operatorId: string;
  callsign: string;
  /** Role from the roster; behaviour keys off the role, never off a callsign. */
  role: Operator["role"];
  position: Vec2;
  task: SquadTask;
  /** 0..1, higher is steadier. */
  composure: number;
  suppressionTarget: string | null;
  injuryDays: number;
}

export interface SubtitleEvent {
  id: string;
  callsign: string;
  textKey: string;
  /** Values interpolated into the translated string. */
  values: Readonly<Record<string, string | number>>;
}

export function createSquad(squadIds: readonly string[]): SquadMemberState[] {
  const members = squadIds
    .map((id) => ROSTER.find((operator) => operator.id === id))
    .filter((operator): operator is Operator => operator !== undefined)
    .slice(0, SQUAD_SIZE);

  return members.map((operator, index) => ({
    operatorId: operator.id,
    callsign: operator.callsign,
    role: operator.role,
    position: { x: index * 0.8, y: 0 },
    task: "holding",
    composure: operator.stats.composure / 100,
    suppressionTarget: null,
    injuryDays: 0,
  }));
}

/**
 * A squad member who sees the weapon light beam reports it. The report travels
 * as a subtitle, which is how the HUD shows radio chatter.
 */
export function reportLightBeam(
  squad: readonly SquadMemberState[],
  seenAt: Vec2,
  distanceMeters: number,
  radioAvailable: boolean,
): SubtitleEvent | null {
  const observer = squad.find((member) => member.injuryDays === 0);
  if (!observer || distanceMeters > 20 || !radioAvailable) return null;
  return {
    id: `light-${observer.callsign}-${Math.round(seenAt.x)}-${Math.round(seenAt.y)}`,
    callsign: observer.callsign,
    textKey: "squad.report.lightBeam",
    values: { callsign: observer.callsign },
  };
}

/** The support gunner suppresses an area, which lowers suspect accuracy. */
export function assignSuppression(
  squad: readonly SquadMemberState[],
  suspectId: string,
): SquadMemberState[] {
  const gunner = squad.some(
    (member) => member.role === "support-gunner" && member.injuryDays === 0,
  );
  if (!gunner) return [...squad];
  return squad.map((member) =>
    member.role === "support-gunner" && member.injuryDays === 0
      ? { ...member, task: "covering", suppressionTarget: suspectId }
      : member,
  );
}

/** 0..1 accuracy penalty applied to a suppressed suspect. */
export function suppressionPenalty(squad: readonly SquadMemberState[], suspectId: string): number {
  const active = squad.filter(
    (member) => member.suppressionTarget === suspectId && member.injuryDays === 0,
  );
  return Math.min(0.45, active.length * 0.22);
}

/** Medic treatment time: Whitfield treats in 8 seconds, anyone else in 15. */
export function treatmentSeconds(squad: readonly SquadMemberState[]): number {
  const medic = squad.some((member) => member.role === "medic" && member.injuryDays === 0);
  return medic ? 8 : 15;
}
