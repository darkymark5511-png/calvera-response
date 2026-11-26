/** Shared Phase 2 AI types. Kept free of React and Three.js so they are testable. */

export interface Vec2 {
  x: number;
  y: number;
}

export type AwarenessState = "idle" | "suspicious" | "alerted" | "combat";

export type SuspectMood = "calm" | "panicked" | "surrendered" | "hostile";

export type CoverQuality = "none" | "partial" | "full";

export interface RoomState {
  id: string;
  /** 0..1 light level used for visibility checks. */
  lightLevel: number;
  /** Whether an irritant gas cloud currently fills the room. */
  gasLevel: number;
  /** Remaining seconds of blocking smoke. */
  smokeSeconds: number;
}

export interface SuspectMemoryEntry {
  /** Seconds since the stimulus was last confirmed. */
  ageSeconds: number;
  position: Vec2;
  kind: "sight" | "sound" | "radio" | "laser" | "light";
}

export interface SuspectBrainState {
  id: string;
  position: Vec2;
  facingRadians: number;
  roomId: string;
  /** 0..100. Crosses thresholds defined in awareness.ts. */
  awareness: number;
  state: AwarenessState;
  mood: SuspectMood;
  aimPoint: Vec2 | null;
  cover: CoverQuality;
  /** Seconds of remaining stun, from stun grenades or non-lethal hits. */
  stunSeconds: number;
  /** Seconds of remaining blindness, from flashbangs. */
  blindSeconds: number;
  /** Damage over time from irritant gas, in health points. */
  health: number;
  memory: SuspectMemoryEntry[];
  /** Suppression applied by support fire, 0..1, decays over time. */
  suppression: number;
}
