import { PENETRATION } from "./constants";
import type { MaterialId } from "./types";

export const FOOTSTEP: Record<string, { volume: number; pitch: number; label: string }> = {
  tile: { volume: 0.7, pitch: 1.15, label: "tile" },
  carpet: { volume: 0.35, pitch: 0.85, label: "carpet" },
  wood: { volume: 0.55, pitch: 1.0, label: "wood" },
  concrete: { volume: 0.75, pitch: 0.95, label: "concrete" },
  metal: { volume: 0.9, pitch: 1.25, label: "metal" },
  gravel: { volume: 0.65, pitch: 0.9, label: "gravel" },
  wetAsphalt: { volume: 0.6, pitch: 0.88, label: "wet asphalt" },
};

export function penetrationFactor(mat: MaterialId | string): number {
  return PENETRATION[mat] ?? 0.5;
}

export function isHardSurface(mat: string): boolean {
  return mat === "concrete" || mat === "brick" || mat === "sheetSteel" || mat === "metal";
}

/** energy kept after passing through material; 0 = stopped */
export function energyAfter(energy: number, mat: MaterialId | string): number {
  return energy * penetrationFactor(mat);
}

export function ricochetChance(mat: string, angleDeg: number): number {
  if (!isHardSurface(mat)) return 0;
  if (angleDeg > 45) return 0;
  return Math.max(0, (45 - angleDeg) / 45) * 0.65;
}
