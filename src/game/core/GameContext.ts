import type { QualityTier, ROE, Stance, FireMode, Lang } from "@/shared/types";
import { QUALITY } from "@/shared/constants";

export interface HudSnapshot {
  stance: Stance;
  stamina: number;
  hp: number;
  ammoCur: number;
  ammoRes: number;
  fireMode: FireMode;
  weaponName: string;
  grenadeFlash: number;
  grenadeStun: number;
  grenadeGas: number;
  grenadeSmoke: number;
  battery: number;
  squad: { callsign: string; hp: number; status: string }[];
  commandState: string | null;
  subtitle: { speaker: string; text: string; until: number }[];
  prompt: string | null;
  toast: string | null;
  objectivesVisible: boolean;
  minimapOpen: boolean;
  paused: boolean;
}

export interface GameContext {
  running: boolean;
  paused: boolean;
  tick: number;
  timeSec: number;
  quality: QualityTier;
  qualityConfig: (typeof QUALITY)[QualityTier];
  lang: Lang;
  roe: ROE;
  missionId: number | null;
  player: {
    hp: number;
    stamina: number;
    stance: Stance;
    pos: { x: number; y: number; z: number };
    yaw: number;
    pitch: number;
    ads: boolean;
    sprint: boolean;
    weaponSlot: number;
    bleeding: number;
  };
  hud: HudSnapshot;
  settings: {
    fov: number;
    sens: number;
    adsMult: number;
    invertY: boolean;
    holdAds: boolean;
    holdCrouch: boolean;
    reduceFlash: boolean;
    reducedMotion: boolean;
    voiceOn: boolean;
    expandedHud: boolean;
  };
}

export function createGameContext(): GameContext {
  return {
    running: false,
    paused: false,
    tick: 0,
    timeSec: 0,
    quality: "HIGH",
    qualityConfig: QUALITY.HIGH,
    lang: "en",
    roe: "DYNAMIC",
    missionId: null,
    player: {
      hp: 100,
      stamina: 100,
      stance: "stand",
      pos: { x: 0, y: 0, z: 0 },
      yaw: 0,
      pitch: 0,
      ads: false,
      sprint: false,
      weaponSlot: 0,
      bleeding: 0,
    },
    hud: {
      stance: "stand",
      stamina: 100,
      hp: 100,
      ammoCur: 30,
      ammoRes: 120,
      fireMode: "auto",
      weaponName: "Vantor KS-9",
      grenadeFlash: 3,
      grenadeStun: 0,
      grenadeGas: 0,
      grenadeSmoke: 0,
      battery: 100,
      squad: [],
      commandState: null,
      subtitle: [],
      prompt: null,
      toast: null,
      objectivesVisible: false,
      minimapOpen: false,
      paused: false,
    },
    settings: {
      fov: 90,
      sens: 1,
      adsMult: 0.6,
      invertY: false,
      holdAds: true,
      holdCrouch: false,
      reduceFlash: false,
      reducedMotion: false,
      voiceOn: true,
      expandedHud: false,
    },
  };
}
