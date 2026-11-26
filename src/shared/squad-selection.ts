import { ROSTER, SQUAD_SIZE, type Operator } from "./roster";

/**
 * Squad selection rules. Three operators go out; at most one of them may be
 * unavailable through injury. The point man is always offered first because the
 * entry order starts with them.
 */

export const MIN_AVAILABLE_FOR_MISSION = 1;

export interface SquadSelection {
  /** Operator ids in entry order. */
  members: string[];
}

export const DEFAULT_SQUAD: readonly string[] = ["op-okafor", "op-reyes", "op-whitfield"];

export function selectionFromIds(ids: readonly string[]): SquadSelection {
  const unique: string[] = [];
  for (const id of ids) {
    if (unique.length >= SQUAD_SIZE) break;
    if (!unique.includes(id) && ROSTER.some((operator) => operator.id === id)) unique.push(id);
  }
  return { members: unique };
}

export function toggleMember(
  selection: SquadSelection,
  operatorId: string,
  injured: readonly string[],
): SquadSelection {
  const available = ROSTER.some(
    (operator) => operator.id === operatorId && !injured.includes(operatorId),
  );
  if (!available) return selection;

  if (selection.members.includes(operatorId)) {
    return { members: selection.members.filter((id) => id !== operatorId) };
  }
  if (selection.members.length >= SQUAD_SIZE) return selection;
  return { members: [...selection.members, operatorId] };
}

export function isMissionReady(
  selection: SquadSelection,
  injured: readonly string[],
): boolean {
  const healthy = selection.members.filter((id) => !injured.includes(id));
  return healthy.length >= MIN_AVAILABLE_FOR_MISSION && selection.members.length > 0;
}

/** Entry order: point man first, then breacher, then the rest of the roster. */
const ENTRY_ORDER: readonly Operator["role"][] = [
  "point-man",
  "breacher",
  "scout",
  "breacher",
  "support-gunner",
  "marksman",
  "medic",
  "technician",
  "negotiator",
];

export function entryOrder(selection: SquadSelection): Operator[] {
  const members = selection.members
    .map((id) => ROSTER.find((operator) => operator.id === id))
    .filter((operator): operator is Operator => operator !== undefined);

  return [...members].sort((a, b) => {
    const rankA = ENTRY_ORDER.indexOf(a.role);
    const rankB = ENTRY_ORDER.indexOf(b.role);
    return rankA - rankB;
  });
}

export function squadSummary(selection: SquadSelection): string {
  return entryOrder(selection)
    .map((operator) => operator.callsign)
    .join(" / ");
}
