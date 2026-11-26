import { DEFAULT_LOADOUT, type Loadout } from "../equipment/catalog";
import { STARTING_FUNDS } from "../economy/funds";

/**
 * Career progress. The shape is deliberately small and JSON-safe because it is
 * exactly what a signed-in account syncs to `game.progress` and what a guest
 * keeps in localStorage under `cr_guest_progress`. Both paths use this type,
 * so a save written offline still loads when the account signs in.
 */

export const CAREER_VERSION = 2;

export interface CareerState {
  version: number;
  missionsCompleted: number;
  funds: number;
  /** Equipment bought outright, by catalogue id. Consumables are not stored. */
  owned: string[];
  loadout: Loadout;
  /** Best rank per mission index, for the career screen. */
  bestRanks: Record<string, string>;
  leadEntries: number;
  updatedAt: string;
}

export function emptyCareer(now = ""): CareerState {
  return {
    version: CAREER_VERSION,
    missionsCompleted: 0,
    funds: STARTING_FUNDS,
    owned: [],
    loadout: { ...DEFAULT_LOADOUT },
    bestRanks: {},
    leadEntries: 0,
    updatedAt: now,
  };
}

/** A single stable object so `useSyncExternalStore` snapshots never churn. */
export const EMPTY_CAREER: CareerState = emptyCareer();

function isLoadout(value: unknown): value is Loadout {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value as Record<string, unknown>).every(
    (entry) => entry === undefined || typeof entry === "string",
  );
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/**
 * Parses a stored career. Anything unrecognised falls back to the empty
 * career rather than throwing, so a corrupt save never blocks play.
 */
export function parseCareer(raw: unknown): CareerState {
  if (typeof raw === "string") {
    try {
      return parseCareer(JSON.parse(raw) as unknown);
    } catch {
      return EMPTY_CAREER;
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return EMPTY_CAREER;

  const record = raw as Record<string, unknown>;
  const owned = Array.isArray(record.owned)
    ? record.owned.filter((entry): entry is string => typeof entry === "string")
    : [];
  const bestRanks: Record<string, string> = {};
  if (record.bestRanks && typeof record.bestRanks === "object" && !Array.isArray(record.bestRanks)) {
    for (const [key, value] of Object.entries(record.bestRanks as Record<string, unknown>)) {
      if (typeof value === "string") bestRanks[key] = value;
    }
  }

  return {
    version: CAREER_VERSION,
    missionsCompleted: Math.max(0, Math.trunc(num(record.missionsCompleted, 0))),
    funds: Math.max(0, Math.trunc(num(record.funds, STARTING_FUNDS))),
    owned,
    loadout: isLoadout(record.loadout) ? record.loadout : { ...DEFAULT_LOADOUT },
    bestRanks,
    leadEntries: Math.max(0, Math.trunc(num(record.leadEntries, 0))),
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : "",
  };
}

export function serialiseCareer(state: CareerState): string {
  return JSON.stringify(state);
}

export interface MissionResult {
  missionIndex: number;
  rank: string;
  payout: number;
  leadEntries: number;
  now: string;
}

/**
 * Applies one finished mission. Payout has already been computed by the
 * economy module, so this is only bookkeeping.
 */
export function applyMissionResult(state: CareerState, result: MissionResult): CareerState {
  const missionKey = String(result.missionIndex);
  const previousRank = state.bestRanks[missionKey];

  return {
    ...state,
    version: CAREER_VERSION,
    missionsCompleted: Math.max(state.missionsCompleted, result.missionIndex),
    funds: Math.max(0, state.funds + Math.max(0, result.payout)),
    bestRanks: {
      ...state.bestRanks,
      [missionKey]: previousRank ?? result.rank,
    },
    leadEntries: state.leadEntries + Math.max(0, result.leadEntries),
    updatedAt: result.now,
  };
}

export function nextMissionIndex(state: CareerState): number {
  return state.missionsCompleted + 1;
}
