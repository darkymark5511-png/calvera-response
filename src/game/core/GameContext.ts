export type QualityTier = "LOW" | "MEDIUM" | "HIGH";
export type ROE = "LETHAL" | "NON_LETHAL" | "DYNAMIC";
export type Stance = "stand" | "crouch" | "prone";
export type FireMode = "semi" | "burst" | "auto";
export type Lang = "en" | "id";

export const QUALITY = {
  LOW: { shadowMap: 1024, cascades: 0, pixelRatioCap: 1.0, post: "none" as const, dynamicLights: 1, renderDist: 45 },
  MEDIUM: { shadowMap: 1536, cascades: 2, pixelRatioCap: 1.5, post: "smaa" as const, dynamicLights: 2, renderDist: 70 },
  HIGH: { shadowMap: 2048, cascades: 3, pixelRatioCap: 2.0, post: "gtao_smaa" as const, dynamicLights: 3, renderDist: 110 },
} as const;

export interface HudSnapshot {
  stance: Stance;
  stamina: number;
  hp: number;
  ammoCur: number;
  ammoRes: number;
  fireMode: FireMode;
  weaponName: string;
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
