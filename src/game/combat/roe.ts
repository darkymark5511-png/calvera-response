/**
 * Rules of engagement. The mission code asks for a verdict before applying
 * damage; a lethal outcome outside the rules writes a violation entry and
 * triggers a LEAD subtitle through the squad brain.
 */

export type RoeMode = "non-lethal" | "restrained" | "lethal-authorized";

export type SuspectPosture = "unaware" | "surrendering" | "armed" | "engaged" | "downed";

export type LethalOutcome = "allowed" | "violation" | "blocked";

export type ViolationCode =
  | "lethal-on-surrendering"
  | "lethal-on-unaware"
  | "lethal-in-non-lethal-mode"
  | "lethal-on-downed"
  | "non-lethal-on-downed";

export interface RoeContext {
  mode: RoeMode;
  posture: SuspectPosture;
  /** Target can be positively identified as a threat. */
  positiveId: boolean;
  /** A teammate or civilian is within the line of fire. */
  collateralRisk: boolean;
}

export interface RoeVerdict {
  outcome: LethalOutcome;
  code: ViolationCode | null;
  /** Translation key for the subtitle or debrief line. */
  messageKey: string;
}

const ALLOWED: RoeVerdict = { outcome: "allowed", code: null, messageKey: "roe.allowed" };

export function evaluateLethalShot(context: RoeContext): RoeVerdict {
  if (context.collateralRisk) {
    return { outcome: "blocked", code: null, messageKey: "roe.blocked.collateral" };
  }
  if (context.mode === "non-lethal") {
    return {
      outcome: "violation",
      code: "lethal-in-non-lethal-mode",
      messageKey: "roe.violation.nonLethalMode",
    };
  }
  if (context.posture === "surrendering") {
    return {
      outcome: "violation",
      code: "lethal-on-surrendering",
      messageKey: "roe.violation.surrendering",
    };
  }
  if (context.posture === "downed") {
    return { outcome: "violation", code: "lethal-on-downed", messageKey: "roe.violation.downed" };
  }
  if (context.posture === "unaware" && !context.positiveId) {
    return {
      outcome: "violation",
      code: "lethal-on-unaware",
      messageKey: "roe.violation.unaware",
    };
  }
  if (context.mode === "restrained" && !context.positiveId) {
    return { outcome: "blocked", code: null, messageKey: "roe.blocked.noPositiveId" };
  }
  return ALLOWED;
}

export function evaluateNonLethalUse(posture: SuspectPosture): RoeVerdict {
  if (posture === "downed") {
    return { outcome: "blocked", code: "non-lethal-on-downed", messageKey: "roe.blocked.downed" };
  }
  return ALLOWED;
}

export interface ViolationEntry {
  code: ViolationCode;
  suspectId: string;
  missionId: string;
  secondsSinceStart: number;
  messageKey: string;
}

export function toViolationEntry(
  verdict: RoeVerdict,
  suspectId: string,
  missionId: string,
  secondsSinceStart: number,
): ViolationEntry | null {
  if (verdict.outcome !== "violation" || verdict.code === null) return null;
  return {
    code: verdict.code,
    suspectId,
    missionId,
    secondsSinceStart,
    messageKey: verdict.messageKey,
  };
}
