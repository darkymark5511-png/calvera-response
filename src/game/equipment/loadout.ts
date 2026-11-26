import { CATALOG_BY_ID, type EquipmentSlot, type Loadout } from "./catalog";

/**
 * Loadout validation and equipment effects. The rules live here so the armory
 * UI, the mission generator and the tests all read the same numbers.
 */

export interface LoadoutProblem {
  slot: EquipmentSlot;
  code: "unknown-item" | "wrong-slot" | "locked" | "duplicate-class";
}

export function validateLoadout(
  loadout: Loadout,
  owned: readonly string[],
  missionsCompleted: number,
): LoadoutProblem[] {
  const problems: LoadoutProblem[] = [];
  const ownedSet = new Set(owned);

  for (const [slot, id] of Object.entries(loadout) as [EquipmentSlot, string | undefined][]) {
    if (!id) continue;
    const item = CATALOG_BY_ID[id];
    if (!item) {
      problems.push({ slot, code: "unknown-item" });
      continue;
    }
    if (item.slot !== slot) {
      problems.push({ slot, code: "wrong-slot" });
      continue;
    }
    const allowed =
      missionsCompleted >= item.unlockAfterMissions && (ownedSet.has(id) || item.perMission);
    if (!allowed) problems.push({ slot, code: "locked" });
  }

  return problems;
}

/** Armor and helmet stack, but each tops out; the sum is capped below 1. */
export const ARMOR_CAP = 0.55;
export const HELMET_CAP = 0.2;

const ARMOR_RATING: Readonly<Record<string, number>> = {
  "iw-plate": 0.4,
};

const HELMET_RATING: Readonly<Record<string, number>> = {
  "hf-helmet": 0.15,
};

const OPTIC_BONUS: Readonly<Record<string, number>> = {
  "sp-scope": 0.2,
};

const NVG_IDS = new Set(["is-goggles"]);
const POLE_CAMERA_IDS = new Set(["tq-polecam"]);
const WEDGE_IDS = new Set(["qw-wedge"]);

export interface LoadoutEffects {
  /** 0..1 damage reduction from armor and helmet together. */
  damageReduction: number;
  /** 0..1 bonus to effective weapon range and hit confidence. */
  opticBonus: number;
  hasNightVision: boolean;
  hasPoleCamera: boolean;
  hasWedge: boolean;
  /** Throwables and medical items carried into the mission. */
  consumables: readonly string[];
}

export function loadoutEffects(loadout: Loadout): LoadoutEffects {
  const ids = Object.values(loadout).filter((id): id is string => Boolean(id));

  const armor = Math.min(
    ARMOR_CAP,
    ids.reduce((sum, id) => sum + (ARMOR_RATING[id] ?? 0), 0),
  );
  const helmet = Math.min(
    HELMET_CAP,
    ids.reduce((sum, id) => sum + (HELMET_RATING[id] ?? 0), 0),
  );

  return {
    damageReduction: Math.min(0.6, armor + helmet),
    opticBonus: ids.reduce((sum, id) => sum + (OPTIC_BONUS[id] ?? 0), 0),
    hasNightVision: ids.some((id) => NVG_IDS.has(id)),
    hasPoleCamera: ids.some((id) => POLE_CAMERA_IDS.has(id)),
    hasWedge: ids.some((id) => WEDGE_IDS.has(id)),
    consumables: ids.filter((id) => CATALOG_BY_ID[id]?.perMission),
  };
}

/** Weight slows the operator. Every item carries a fixed abstract load. */
export const MAX_LOAD = 12;

const ITEM_LOAD: Readonly<Record<string, number>> = {
  "vt-carbine": 3,
  "hl-subgun": 2,
  "cv-shotgun": 3,
  "rg-dmr": 4,
  "br-bolt": 5,
  "hv-pistol": 1,
  "qw-dart": 2,
  "sp-scope": 1,
  "iw-plate": 3,
  "hf-helmet": 1,
  "is-goggles": 1,
  "ms-ram": 2,
  "tm-charge": 1,
  "bv-flash": 1,
  "bv-smoke": 1,
  "tq-bandage": 1,
  "tq-polecam": 1,
  "qw-wedge": 1,
};

export function loadoutWeight(loadout: Loadout): number {
  return Object.values(loadout).reduce((sum, id) => sum + (id ? (ITEM_LOAD[id] ?? 0) : 0), 0);
}

/** 1.0 at or below half load, falling to 0.75 at the cap. */
export function mobilityFactor(loadout: Loadout): number {
  const load = loadoutWeight(loadout);
  if (load <= MAX_LOAD / 2) return 1;
  if (load >= MAX_LOAD) return 0.75;
  const over = (load - MAX_LOAD / 2) / (MAX_LOAD / 2);
  return Number((1 - over * 0.25).toFixed(3));
}
