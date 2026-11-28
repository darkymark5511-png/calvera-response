import { ZONE_MULT } from "@/shared/constants";
import { energyAfter, ricochetChance } from "@/shared/materials";
import type { BodyZone, MaterialId } from "@/shared/types";

export interface HitInput {
  baseDamage: number;
  rangeM: number;
  effectiveRangeM: number;
  zone: BodyZone;
  protectionPercent: number;
  materialsPassed: MaterialId[];
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
    energy = energyAfter(energy, m);
    if (energy < 0.05) {
      return { damage: 0, stopped: true, ricochet: false, remainingEnergy: 0 };
    }
  }
  if (input.lastMaterial && input.angleDeg !== undefined) {
    const rc = ricochetChance(input.lastMaterial, input.angleDeg);
    if (Math.random() < rc) {
      return { damage: 0, stopped: false, ricochet: true, remainingEnergy: energy * 0.4 };
    }
  }
  const rangeFactor = Math.max(0.15, 1 - Math.max(0, input.rangeM - input.effectiveRangeM * 0.5) / (input.effectiveRangeM * 1.5));
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

export function applyBleeding(hp: number, bleedPerSec: number, dt: number): { hp: number; bleed: number } {
  if (bleedPerSec <= 0) return { hp, bleed: 0 };
  const loss = bleedPerSec * dt;
  return { hp: Math.max(0, hp - loss), bleed: bleedPerSec };
}
