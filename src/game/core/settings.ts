import type { Lang } from "@/shared/types";
import { LS_SETTINGS } from "@/shared/constants";

export type Quality = "low" | "medium" | "high";
export interface Settings {
  quality: Quality; resScale: number; fov: number; ao: boolean; smaa: boolean; grain: boolean; vignette: boolean; reduceFlash: boolean;
  master: number; sfx: number; ambience: number; voice: number; voiceOn: boolean; subsOn: boolean;
  sens: number; adsMul: number; invertY: boolean; touchSens: number; holdAds: boolean; holdCrouch: boolean;
  subSize: number; subBg: number; colorblind: boolean; reducedMotion: boolean; expandedHud: boolean; lang: Lang; touchScale: number;
}
export interface QualityDef { shadow: number; cascades: number; pr: number; post: "none" | "smaa" | "gtao"; maps: boolean; lights: number; dist: number; crowd: number; aniso: number; tex: number; hero: number }
export const QUALITY: Record<Quality, QualityDef> = {
  low: { shadow: 1024, cascades: 0, pr: 1.0, post: "none", maps: false, lights: 1, dist: 45, crowd: 0.35, aniso: 2, tex: 512, hero: 512 },
  medium: { shadow: 1536, cascades: 2, pr: 1.5, post: "smaa", maps: true, lights: 2, dist: 70, crowd: 0.65, aniso: 4, tex: 1024, hero: 1024 },
  high: { shadow: 2048, cascades: 3, pr: 2.0, post: "gtao", maps: true, lights: 3, dist: 110, crowd: 1, aniso: 8, tex: 1024, hero: 2048 },
};

export const DEFAULT_SETTINGS: Settings = {
  quality: "medium", resScale: 1, fov: 75, ao: true, smaa: true, grain: false, vignette: false, reduceFlash: false,
  master: 0.8, sfx: 0.9, ambience: 0.7, voice: 0.9, voiceOn: true, subsOn: true,
  sens: 1, adsMul: 0.7, invertY: false, touchSens: 1, holdAds: true, holdCrouch: false,
  subSize: 100, subBg: 0.55, colorblind: false, reducedMotion: false, expandedHud: false, lang: "en", touchScale: 1,
};

export const isPhone = (): boolean => typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(LS_SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch { /* corrupt storage falls back to defaults */ }
  return { ...DEFAULT_SETTINGS, quality: isPhone() ? "medium" : "high", lang: typeof navigator !== "undefined" && navigator.language.startsWith("id") ? "id" : "en" };
}
export function persistSettings(s: Settings): void {
  try { localStorage.setItem(LS_SETTINGS, JSON.stringify(s)); } catch { /* quota */ }
}
