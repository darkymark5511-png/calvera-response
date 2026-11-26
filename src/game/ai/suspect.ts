import type { RoomState, SuspectBrainState, Vec2 } from "./types";
import { canSee, type SightQuery } from "../perception/visibility";
import {
  applyLaserExposure,
  clampAwareness,
  decayAwareness,
  escalationFromLightBeam,
  resolveState,
} from "./awareness";

export interface TickInput {
  seconds: number;
  room: RoomState;
  smokeBlocks: boolean;
  observerHasNightVision: boolean;
  laserOnBody: boolean;
  /** Player is within 20 m of the suspect and the weapon light is on. */
  lightBeamVisible: boolean;
  /** Whether something blocked the sight line this tick. */
  sightBlockedByWall: boolean;
  playerPosition: Vec2;
}

export function createSuspect(
  id: string,
  position: Vec2,
  roomId: string,
  facingRadians = 0,
): SuspectBrainState {
  return {
    id,
    position,
    facingRadians,
    roomId,
    awareness: 0,
    state: "idle",
    mood: "calm",
    aimPoint: null,
    cover: "none",
    stunSeconds: 0,
    blindSeconds: 0,
    health: 100,
    memory: [],
    suppression: 0,
  };
}

function facingVector(radians: number): Vec2 {
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

/**
 * Advances one suspect. Order matters: status effects first, then perception,
 * then awareness decay, then the derived state and aim point.
 */
export function tickSuspect(state: SuspectBrainState, input: TickInput): SuspectBrainState {
  const seconds = Math.max(0, input.seconds);

  const stunSeconds = Math.max(0, state.stunSeconds - seconds);
  const blindSeconds = Math.max(0, state.blindSeconds - seconds);
  const stunned = stunSeconds > 0;
  const blind = blindSeconds > 0;

  let awareness = state.awareness;

  if (!stunned) {
    const query: SightQuery = {
      from: state.position,
      facing: facingVector(state.facingRadians),
      target: input.playerPosition,
      halfAngleRadians: Math.PI / 2.6,
      maxRangeMeters: 24,
      room: input.room,
      smokeBlocks: input.smokeBlocks,
      observerHasNightVision: input.observerHasNightVision,
      targetEmitsLight: input.lightBeamVisible,
    };

    const sight = canSee(query, input.sightBlockedByWall);
    if (sight.visible && !blind) {
      awareness += 26 * sight.confidence * seconds;
    }

    if (input.lightBeamVisible && !blind) {
      awareness = escalationFromLightBeam(awareness);
      awareness += 8 * seconds;
    }

    if (input.laserOnBody && !blind) {
      awareness = applyLaserExposure(awareness, seconds, true);
    }

    const stimulated = (sight.visible && !blind) || input.lightBeamVisible || input.laserOnBody;
    if (!stimulated) {
      awareness = decayAwareness(awareness, seconds);
    }
  }

  awareness = clampAwareness(awareness);
  const nextState = resolveState(state.state, awareness);

  const mood =
    state.mood === "surrendered"
      ? "surrendered"
      : nextState === "combat"
        ? "hostile"
        : nextState === "alerted"
          ? "panicked"
          : state.mood;

  const aimPoint =
    nextState === "combat" || nextState === "alerted" ? input.playerPosition : null;

  return {
    ...state,
    stunSeconds,
    blindSeconds,
    awareness,
    state: nextState,
    mood,
    aimPoint,
    suppression: Math.max(0, state.suppression - seconds * 0.25),
  };
}

/** Applies a stun from a stun grenade or a baton strike. */
export function applyStun(state: SuspectBrainState, seconds: number): SuspectBrainState {
  return { ...state, stunSeconds: Math.max(state.stunSeconds, seconds) };
}

/** Applies flashbang blindness. Night vision is blanked by the caller. */
export function applyBlind(state: SuspectBrainState, seconds: number): SuspectBrainState {
  return { ...state, blindSeconds: Math.max(state.blindSeconds, seconds) };
}

/** Irritant gas damage over time; a sealed respirator makes the wearer immune. */
export function applyGas(
  state: SuspectBrainState,
  seconds: number,
  protectedByMask: boolean,
): SuspectBrainState {
  if (protectedByMask) return state;
  const damage = seconds * 4;
  return {
    ...state,
    health: Math.max(0, state.health - damage),
    awareness: clampAwareness(state.awareness + seconds * 12),
  };
}

/** Raises panic as the suspect's awareness climbs, per the Phase 2 rules. */
export function panicLevel(state: SuspectBrainState): number {
  return clampAwareness(state.awareness * 0.9 + (100 - state.health) * 0.1);
}
