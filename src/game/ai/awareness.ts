import type { AwarenessState } from "./types";

/**
 * Awareness thresholds. A suspect moves up a state as awareness rises and only
 * drops back after the numbers fall well below the entry point, so they do not
 * flicker between states at a boundary.
 */
export const AWARENESS = {
  suspiciousEnter: 25,
  suspiciousExit: 15,
  alertedEnter: 55,
  alertedExit: 45,
  combatEnter: 80,
  combatExit: 70,
  max: 100,
} as const;

/** Points per second gained while a laser dot rests on the body. */
export const LASER_AWARENESS_PER_SECOND = 10;

/** Points a suspect gains when they see a weapon light beam within range. */
export const LIGHT_BEAM_AWARENESS_GAIN = 30;

export function clampAwareness(value: number): number {
  return Math.min(AWARENESS.max, Math.max(0, value));
}

/**
 * Resolves the next awareness state. Rising uses the enter thresholds, falling
 * uses the lower exit thresholds, which gives the meter hysteresis.
 */
export function resolveState(current: AwarenessState, awareness: number): AwarenessState {
  const value = clampAwareness(awareness);
  const rising = stateRank(value) > awarenessRank(current);

  if (rising) {
    if (value >= AWARENESS.combatEnter) return "combat";
    if (value >= AWARENESS.alertedEnter) return "alerted";
    if (value >= AWARENESS.suspiciousEnter) return "suspicious";
    return current;
  }

  if (current === "combat" && value < AWARENESS.combatExit) {
    return value >= AWARENESS.alertedExit ? "alerted" : "suspicious";
  }
  if (current === "alerted" && value < AWARENESS.alertedExit) {
    return value >= AWARENESS.suspiciousExit ? "suspicious" : "idle";
  }
  if (current === "suspicious" && value < AWARENESS.suspiciousExit) {
    return "idle";
  }
  return current;
}

/** Ordinal rank of a state, used for rise detection. */
export function awarenessRank(state: AwarenessState): number {
  switch (state) {
    case "idle":
      return 0;
    case "suspicious":
      return 1;
    case "alerted":
      return 2;
    case "combat":
      return 3;
  }
}

/** The state a raw awareness value would produce on entry thresholds. */
function stateRank(value: number): number {
  if (value >= AWARENESS.combatEnter) return 3;
  if (value >= AWARENESS.alertedEnter) return 2;
  if (value >= AWARENESS.suspiciousEnter) return 1;
  return 0;
}

/** Applies the laser rule: 10 points per second while the dot sits on a body. */
export function applyLaserExposure(
  awareness: number,
  seconds: number,
  laserOnBody: boolean,
): number {
  if (!laserOnBody || seconds <= 0) return clampAwareness(awareness);
  return clampAwareness(awareness + LASER_AWARENESS_PER_SECOND * seconds);
}

/** Decay while the suspect has no fresh stimulus. */
export function decayAwareness(awareness: number, seconds: number, decayPerSecond = 4): number {
  if (seconds <= 0) return clampAwareness(awareness);
  return clampAwareness(awareness - decayPerSecond * seconds);
}

/** A suspect that sees a light beam jumps to at least SUSPICIOUS. */
export function escalationFromLightBeam(awareness: number): number {
  return clampAwareness(Math.max(awareness, AWARENESS.suspiciousEnter));
}
