/**
 * Squad roster shared with Phase 2 AI and the Phase 3b roster room.
 * Every operator has a full name; the callsign is the surname.
 * The only nickname in the unit is Simon "Wiper" Kowalczyk.
 */

export type OperatorRole =
  | "breacher"
  | "point-man"
  | "marksman"
  | "medic"
  | "technician"
  | "negotiator"
  | "support-gunner"
  | "scout";

export type VoiceProfile =
  | "clipped-baritone"
  | "warm-tenor"
  | "cool-alto"
  | "steady-bass"
  | "dry-baritone"
  | "measured-tenor"
  | "bright-alto"
  | "light-tenor";

export interface OperatorStats {
  /** 0..100 — weapon handling accuracy. */
  accuracy: number;
  /** 0..100 — resistance to panic and suppression. */
  composure: number;
  /** 0..100 — movement and reaction speed. */
  speed: number;
  /** 0..100 — health and armor resilience. */
  durability: number;
}

export interface Operator {
  id: string;
  /** Full name, e.g. "Marcus Reyes". */
  fullName: string;
  /** Callsign is always the surname. */
  callsign: string;
  role: OperatorRole;
  roleKey: string;
  abilityKey: string;
  abilityDescriptionKey: string;
  stats: OperatorStats;
  voice: VoiceProfile;
  maxLevel: number;
}

export const ROSTER: readonly Operator[] = [
  {
    id: "op-reyes",
    fullName: "Marcus Reyes",
    callsign: "Reyes",
    role: "breacher",
    roleKey: "roster.role.breacher",
    abilityKey: "roster.ability.reyes",
    abilityDescriptionKey: "roster.ability.reyesDesc",
    stats: { accuracy: 72, composure: 78, speed: 74, durability: 80 },
    voice: "clipped-baritone",
    maxLevel: 10,
  },
  {
    id: "op-okafor",
    fullName: "Tom Okafor",
    callsign: "Okafor",
    role: "point-man",
    roleKey: "roster.role.pointMan",
    abilityKey: "roster.ability.okafor",
    abilityDescriptionKey: "roster.ability.okaforDesc",
    stats: { accuracy: 75, composure: 80, speed: 82, durability: 76 },
    voice: "steady-bass",
    maxLevel: 10,
  },
  {
    id: "op-steven",
    fullName: "Jim Steven",
    callsign: "Steven",
    role: "marksman",
    roleKey: "roster.role.marksman",
    abilityKey: "roster.ability.steven",
    abilityDescriptionKey: "roster.ability.stevenDesc",
    stats: { accuracy: 92, composure: 84, speed: 58, durability: 66 },
    voice: "measured-tenor",
    maxLevel: 10,
  },
  {
    id: "op-whitfield",
    fullName: "Dana Whitfield",
    callsign: "Whitfield",
    role: "medic",
    roleKey: "roster.role.medic",
    abilityKey: "roster.ability.whitfield",
    abilityDescriptionKey: "roster.ability.whitfieldDesc",
    stats: { accuracy: 64, composure: 88, speed: 72, durability: 70 },
    voice: "cool-alto",
    maxLevel: 10,
  },
  {
    id: "op-wiper",
    fullName: 'Simon "Wiper" Kowalczyk',
    callsign: "Wiper",
    role: "technician",
    roleKey: "roster.role.technician",
    abilityKey: "roster.ability.wiper",
    abilityDescriptionKey: "roster.ability.wiperDesc",
    stats: { accuracy: 70, composure: 76, speed: 70, durability: 68 },
    voice: "dry-baritone",
    maxLevel: 10,
  },
  {
    id: "op-carvajal",
    fullName: "Luis Carvajal",
    callsign: "Carvajal",
    role: "negotiator",
    roleKey: "roster.role.negotiator",
    abilityKey: "roster.ability.carvajal",
    abilityDescriptionKey: "roster.ability.carvajalDesc",
    stats: { accuracy: 66, composure: 94, speed: 68, durability: 66 },
    voice: "warm-tenor",
    maxLevel: 10,
  },
  {
    id: "op-ellery",
    fullName: "Ruth Ellery",
    callsign: "Ellery",
    role: "support-gunner",
    roleKey: "roster.role.supportGunner",
    abilityKey: "roster.ability.ellery",
    abilityDescriptionKey: "roster.ability.elleryDesc",
    stats: { accuracy: 68, composure: 80, speed: 54, durability: 88 },
    voice: "bright-alto",
    maxLevel: 10,
  },
  {
    id: "op-cole",
    fullName: "Nathan Cole",
    callsign: "Cole",
    role: "scout",
    roleKey: "roster.role.scout",
    abilityKey: "roster.ability.cole",
    abilityDescriptionKey: "roster.ability.coleDesc",
    stats: { accuracy: 74, composure: 72, speed: 90, durability: 62 },
    voice: "light-tenor",
    maxLevel: 10,
  },
] as const;

export const SQUAD_SIZE = 3;

/** Fast lookup used by the squad brain and the command wheel. */
export const ROSTER_BY_CALLSIGN: Readonly<Record<string, Operator>> =
  Object.fromEntries(ROSTER.map((operator) => [operator.callsign, operator]));

/** Callsign lookup. The stored form is the surname with its original casing. */
export function operatorByCallsign(callsign: string): Operator | undefined {
  const direct = ROSTER_BY_CALLSIGN[callsign];
  if (direct) return direct;
  const wanted = callsign.trim().toLowerCase();
  return ROSTER.find((operator) => operator.callsign.toLowerCase() === wanted);
}

export function operatorById(id: string): Operator | undefined {
  return ROSTER.find((operator) => operator.id === id);
}
