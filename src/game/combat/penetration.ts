/**
 * Material penetration. A round loses energy crossing a material and either
 * stops, passes with reduced damage, or passes cleanly.
 */

export type MaterialId =
  | "drywall"
  | "plaster"
  | "plywood"
  | "hollow-door"
  | "solid-door"
  | "glass"
  | "brick"
  | "concrete"
  | "steel"
  | "sandbag"
  | "body-armor";

export type CaliberClass =
  | "9mm"
  | "40"
  | "45"
  | "357"
  | "556"
  | "762"
  | "308"
  | "338"
  | "12-gauge"
  | "non-lethal";

export interface MaterialProfile {
  id: MaterialId;
  labelKey: string;
  /** Damage retained after crossing, 0..1. */
  retention: number;
  /** Whether a round can pass through at all. */
  penetrable: boolean;
}

export const MATERIALS: Readonly<Record<MaterialId, MaterialProfile>> = {
  drywall: { id: "drywall", labelKey: "pen.material.drywall", retention: 0.7, penetrable: true },
  plaster: { id: "plaster", labelKey: "pen.material.plaster", retention: 0.55, penetrable: true },
  plywood: { id: "plywood", labelKey: "pen.material.plywood", retention: 0.5, penetrable: true },
  "hollow-door": {
    id: "hollow-door",
    labelKey: "pen.material.hollowDoor",
    retention: 0.45,
    penetrable: true,
  },
  "solid-door": {
    id: "solid-door",
    labelKey: "pen.material.solidDoor",
    retention: 0.2,
    penetrable: true,
  },
  glass: { id: "glass", labelKey: "pen.material.glass", retention: 0.85, penetrable: true },
  brick: { id: "brick", labelKey: "pen.material.brick", retention: 0.1, penetrable: true },
  concrete: { id: "concrete", labelKey: "pen.material.concrete", retention: 0, penetrable: false },
  steel: { id: "steel", labelKey: "pen.material.steel", retention: 0, penetrable: false },
  sandbag: { id: "sandbag", labelKey: "pen.material.sandbag", retention: 0.05, penetrable: true },
  "body-armor": {
    id: "body-armor",
    labelKey: "pen.material.bodyArmor",
    retention: 0.1,
    penetrable: true,
  },
};

/** Base multiplier per caliber against an average wall. */
export const CALIBER_PENETRATION: Readonly<Record<CaliberClass, number>> = {
  "9mm": 0.85,
  "40": 0.9,
  "45": 0.95,
  "357": 1.0,
  "556": 1.15,
  "762": 1.25,
  "308": 1.35,
  "338": 1.5,
  "12-gauge": 0.55,
  "non-lethal": 0,
};

export interface PenetrationInput {
  baseDamage: number;
  caliber: CaliberClass;
  materials: readonly MaterialId[];
}

export interface PenetrationResult {
  damage: number;
  stopped: boolean;
  /** Index of the material that stopped the round, if any. */
  stoppedBy: MaterialId | null;
  entries: number;
}

/**
 * Applies each material in order. A round that is not penetrable, or whose
 * damage falls below one point, stops at that layer.
 */
export function resolvePenetration(input: PenetrationInput): PenetrationResult {
  const caliberFactor = CALIBER_PENETRATION[input.caliber];
  if (caliberFactor <= 0) {
    return { damage: 0, stopped: true, stoppedBy: input.materials[0] ?? null, entries: 0 };
  }

  let damage = input.baseDamage;
  let entries = 0;

  for (const materialId of input.materials) {
    const material = MATERIALS[materialId];
    if (!material.penetrable) {
      return { damage: 0, stopped: true, stoppedBy: materialId, entries };
    }
    damage *= material.retention * caliberFactor;
    entries += 1;
    if (damage < 1) {
      return { damage: 0, stopped: true, stoppedBy: materialId, entries };
    }
  }

  return { damage: Math.round(damage), stopped: false, stoppedBy: null, entries };
}

/** Number of layers a caliber may cross before it always stops. */
export function maxPenetrableLayers(caliber: CaliberClass): number {
  if (caliber === "non-lethal") return 0;
  if (caliber === "12-gauge") return 1;
  if (caliber === "9mm" || caliber === "40" || caliber === "45" || caliber === "357") return 2;
  return 3;
}
