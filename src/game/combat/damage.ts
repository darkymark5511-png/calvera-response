export type BodyZone = "head" | "neck" | "torso" | "arms" | "legs";

const ZONE_MULT: Record<BodyZone, number> = {
  head: 2.5,
  neck: 2.0,
  torso: 1.0,
  arms: 0.6,
  legs: 0.65,
};

const PENETRATION: Record<string, number> = {
  drywall: 0.8,
  plywood: 0.6,
  woodDoor: 0.65,
  safetyGlass: 0.7,
  carBody: 0.4,
  brick: 0.3,
  concrete: 0.1,
  sheetSteel: 0.05,
};

export interface HitInput {
  baseDamage: number;
  rangeM: number;
  effectiveRangeM: number;
  zone: BodyZone;
  protectionPercent: number;
  materialsPassed: string[];
  angleDeg?: number;
  lastMaterial?: string;
}

export interface HitResult {
  damage: number;
  stopped: boolean;
  ricochet: boolean;
  remainingEnergy: number;
}

export function computeDamage(input: HitInput): HitResult {
  let energy = 1;
  for (const m of input.materialsPassed) {
    energy *= PENETRATION[m] ?? 0.5;
    if (energy < 0.05) {
      return { damage: 0, stopped: true, ricochet: false, remainingEnergy: 0 };
    }
  }
  const rangeFactor = Math.max(
    0.15,
    1 - Math.max(0, input.rangeM - input.effectiveRangeM * 0.5) / (input.effectiveRangeM * 1.5)
  );
  const zone = ZONE_MULT[input.zone] ?? 1;
  const prot = Math.min(0.95, Math.max(0, input.protectionPercent / 100));
  const dmg = input.baseDamage * rangeFactor * energy * zone * (1 - prot);
  return {
    damage: Math.max(0, Math.round(dmg * 10) / 10),
    stopped: false,
    ricochet: false,
    remainingEnergy: energy,
  };
}
