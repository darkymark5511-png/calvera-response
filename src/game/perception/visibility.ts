import type { RoomState, Vec2 } from "../ai/types";

export interface SightQuery {
  /** Suspect eye position. */
  from: Vec2;
  /** Unit vector the suspect is facing. */
  facing: Vec2;
  /** Point being observed. */
  target: Vec2;
  /** Half-angle of the vision cone, in radians. */
  halfAngleRadians: number;
  maxRangeMeters: number;
  room: RoomState;
  /** Smoke currently blocks line of sight. */
  smokeBlocks: boolean;
  /** The observer is wearing night vision. */
  observerHasNightVision: boolean;
  /** The target is carrying a light source. */
  targetEmitsLight: boolean;
}

export interface SightResult {
  visible: boolean;
  /** 0..1, feeds awareness gain rate. */
  confidence: number;
  reason: "seen" | "out-of-cone" | "out-of-range" | "smoke" | "too-dark" | "wall";
}

const MIN_VISIBLE_LIGHT = 0.18;

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalize(v: Vec2): Vec2 {
  const length = Math.hypot(v.x, v.y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: v.x / length, y: v.y / length };
}

export function dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

/**
 * Suspects use their own room light level to decide whether they can see the
 * player. Night vision on the player does not brighten the world for them.
 */
export function canSee(query: SightQuery, wallsBlock = false): SightResult {
  if (wallsBlock) {
    return { visible: false, confidence: 0, reason: "wall" };
  }
  if (query.smokeBlocks) {
    return { visible: false, confidence: 0, reason: "smoke" };
  }

  const toTarget = { x: query.target.x - query.from.x, y: query.target.y - query.from.y };
  const range = Math.hypot(toTarget.x, toTarget.y);
  if (range > query.maxRangeMeters) {
    return { visible: false, confidence: 0, reason: "out-of-range" };
  }

  const direction = normalize(toTarget);
  const cosine = dot(normalize(query.facing), direction);
  const angle = Math.acos(Math.min(1, Math.max(-1, cosine)));
  if (angle > query.halfAngleRadians) {
    return { visible: false, confidence: 0, reason: "out-of-cone" };
  }

  const light = query.room.lightLevel;
  const hasOwnLight = query.targetEmitsLight;
  if (light < MIN_VISIBLE_LIGHT && !hasOwnLight && !query.observerHasNightVision) {
    return { visible: false, confidence: 0, reason: "too-dark" };
  }

  // Confidence falls off with range and darkness, rises with a light source.
  const rangeFactor = 1 - Math.min(range / query.maxRangeMeters, 1) * 0.6;
  const lightFactor = hasOwnLight ? 1 : Math.max(light, 0.2);
  return {
    visible: true,
    confidence: Math.min(1, rangeFactor * lightFactor),
    reason: "seen",
  };
}
