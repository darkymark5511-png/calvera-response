import { describe, expect, it } from "vitest";
import {
  applyLaserExposure,
  clampAwareness,
  decayAwareness,
  escalationFromLightBeam,
  resolveState,
  LASER_AWARENESS_PER_SECOND,
} from "@/game/ai/awareness";
import { canSee, type SightQuery } from "@/game/perception/visibility";
import { applyBlind, applyGas, applyStun, createSuspect, tickSuspect, panicLevel } from "@/game/ai/suspect";
import { resolvePenetration, maxPenetrableLayers } from "@/game/combat/penetration";
import { evaluateLethalShot, toViolationEntry } from "@/game/combat/roe";
import { COMMANDS, resolveAcknowledgement, preferredOperator } from "@/game/commands/radial";
import {
  assignSuppression,
  createSquad,
  reportLightBeam,
  suppressionPenalty,
  treatmentSeconds,
} from "@/game/ai/squad";
import { ROSTER, SQUAD_SIZE, operatorByCallsign } from "@/shared/roster";
import type { RoomState } from "@/game/ai/types";

const litRoom: RoomState = { id: "lobby", lightLevel: 0.8, gasLevel: 0, smokeSeconds: 0 };
const darkRoom: RoomState = { id: "stairwell", lightLevel: 0.05, gasLevel: 0, smokeSeconds: 0 };

const baseQuery: SightQuery = {
  from: { x: 0, y: 0 },
  facing: { x: 1, y: 0 },
  target: { x: 5, y: 0 },
  halfAngleRadians: Math.PI / 3,
  maxRangeMeters: 20,
  room: litRoom,
  smokeBlocks: false,
  observerHasNightVision: false,
  targetEmitsLight: false,
};

describe("awareness meter", () => {
  it("clamps to 0..100", () => {
    expect(clampAwareness(-5)).toBe(0);
    expect(clampAwareness(140)).toBe(100);
  });

  it("rises through the thresholds", () => {
    expect(resolveState("idle", 30)).toBe("suspicious");
    expect(resolveState("idle", 60)).toBe("alerted");
    expect(resolveState("idle", 85)).toBe("combat");
  });

  it("holds state inside the hysteresis band", () => {
    expect(resolveState("alerted", 50)).toBe("alerted");
    expect(resolveState("combat", 75)).toBe("combat");
  });

  it("falls back below the exit thresholds", () => {
    expect(resolveState("combat", 40)).toBe("suspicious");
    expect(resolveState("alerted", 10)).toBe("idle");
    expect(resolveState("suspicious", 10)).toBe("idle");
  });

  it("gives 10 points per second to a laser dot resting on a body", () => {
    expect(LASER_AWARENESS_PER_SECOND).toBe(10);
    expect(applyLaserExposure(0, 2, true)).toBe(20);
    expect(applyLaserExposure(95, 3, true)).toBe(100);
    expect(applyLaserExposure(40, 3, false)).toBe(40);
  });

  it("decays without a stimulus", () => {
    expect(decayAwareness(60, 5)).toBe(40);
    expect(decayAwareness(2, 5)).toBe(0);
  });

  it("a light beam escalates to at least suspicious", () => {
    expect(escalationFromLightBeam(0)).toBe(25);
    expect(escalationFromLightBeam(70)).toBe(70);
  });
});

describe("perception", () => {
  it("sees a target in the cone, in range, in light", () => {
    const result = canSee(baseQuery);
    expect(result.visible).toBe(true);
    expect(result.reason).toBe("seen");
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("rejects an out-of-cone target", () => {
    expect(canSee({ ...baseQuery, target: { x: -5, y: 0 } }).reason).toBe("out-of-cone");
  });

  it("rejects an out-of-range target", () => {
    expect(canSee({ ...baseQuery, target: { x: 40, y: 0 } }).reason).toBe("out-of-range");
  });

  it("smoke blocks line of sight", () => {
    expect(canSee({ ...baseQuery, smokeBlocks: true }).reason).toBe("smoke");
  });

  it("walls block line of sight", () => {
    expect(canSee(baseQuery, true).reason).toBe("wall");
  });

  it("a dark room hides an unlit player, but a lit player is still seen", () => {
    expect(canSee({ ...baseQuery, room: darkRoom }).reason).toBe("too-dark");
    expect(canSee({ ...baseQuery, room: darkRoom, targetEmitsLight: true }).visible).toBe(true);
  });

  it("player night vision does not make the player visible to the suspect", () => {
    const withNvg = canSee({ ...baseQuery, room: darkRoom, observerHasNightVision: false });
    expect(withNvg.visible).toBe(false);
  });
});

describe("suspect brain", () => {
  it("escalates to at least suspicious when the light beam hits", () => {
    const suspect = createSuspect("s1", { x: 0, y: 0 }, "lobby");
    const next = tickSuspect(suspect, {
      seconds: 0.1,
      room: litRoom,
      smokeBlocks: false,
      observerHasNightVision: false,
      laserOnBody: false,
      lightBeamVisible: true,
      sightBlockedByWall: false,
      playerPosition: { x: 4, y: 0 },
    });
    expect(next.awareness).toBeGreaterThanOrEqual(25);
    expect(["suspicious", "alerted", "combat"]).toContain(next.state);
  });

  it("gains 10 points per second under the laser", () => {
    const suspect = createSuspect("s1", { x: 0, y: 0 }, "lobby");
    const next = tickSuspect(suspect, {
      seconds: 1,
      room: litRoom,
      smokeBlocks: false,
      observerHasNightVision: false,
      laserOnBody: true,
      lightBeamVisible: false,
      sightBlockedByWall: true,
      playerPosition: { x: 4, y: 0 },
    });
    expect(next.awareness).toBeCloseTo(10, 5);
  });

  it("does not see through a wall", () => {
    const suspect = createSuspect("s1", { x: 0, y: 0 }, "lobby");
    const next = tickSuspect(suspect, {
      seconds: 2,
      room: litRoom,
      smokeBlocks: false,
      observerHasNightVision: false,
      laserOnBody: false,
      lightBeamVisible: false,
      sightBlockedByWall: true,
      playerPosition: { x: 4, y: 0 },
    });
    expect(next.awareness).toBe(0);
    expect(next.state).toBe("idle");
  });

  it("stun stops movement and perception", () => {
    const stunned = applyStun(createSuspect("s1", { x: 0, y: 0 }, "lobby"), 4);
    expect(stunned.stunSeconds).toBe(4);
    const ticked = tickSuspect(stunned, {
      seconds: 1,
      room: litRoom,
      smokeBlocks: false,
      observerHasNightVision: false,
      laserOnBody: false,
      lightBeamVisible: true,
      sightBlockedByWall: false,
      playerPosition: { x: 1, y: 0 },
    });
    expect(ticked.stunSeconds).toBe(3);
    expect(ticked.awareness).toBe(0);
  });

  it("flashbang blindness suppresses perception", () => {
    const blind = applyBlind(createSuspect("s1", { x: 0, y: 0 }, "lobby"), 5);
    const ticked = tickSuspect(blind, {
      seconds: 1,
      room: litRoom,
      smokeBlocks: false,
      observerHasNightVision: false,
      laserOnBody: false,
      lightBeamVisible: true,
      sightBlockedByWall: false,
      playerPosition: { x: 1, y: 0 },
    });
    expect(ticked.blindSeconds).toBe(4);
    expect(ticked.awareness).toBe(0);
  });

  it("gas damages unprotected suspects and is blocked by a mask", () => {
    const suspect = createSuspect("s1", { x: 0, y: 0 }, "lobby");
    expect(applyGas(suspect, 1, false).health).toBe(96);
    expect(applyGas(suspect, 1, true).health).toBe(100);
  });

  it("reports panic rising with awareness and falling health", () => {
    const calm = createSuspect("s1", { x: 0, y: 0 }, "lobby");
    const hurt = { ...calm, awareness: 80, health: 40 };
    expect(panicLevel(hurt)).toBeGreaterThan(panicLevel(calm));
  });
});

describe("rules of engagement", () => {
  it("allows a lethal shot on an armed suspect", () => {
    expect(
      evaluateLethalShot({
        mode: "lethal-authorized",
        posture: "armed",
        positiveId: true,
        collateralRisk: false,
      }).outcome,
    ).toBe("allowed");
  });

  it("flags a lethal shot on a surrendering suspect", () => {
    const verdict = evaluateLethalShot({
      mode: "restrained",
      posture: "surrendering",
      positiveId: true,
      collateralRisk: false,
    });
    expect(verdict.outcome).toBe("violation");
    expect(verdict.code).toBe("lethal-on-surrendering");
  });

  it("flags a lethal shot in a non-lethal operation", () => {
    expect(
      evaluateLethalShot({
        mode: "non-lethal",
        posture: "armed",
        positiveId: true,
        collateralRisk: false,
      }).code,
    ).toBe("lethal-in-non-lethal-mode");
  });

  it("blocks a shot with a teammate in the line of fire", () => {
    expect(
      evaluateLethalShot({
        mode: "lethal-authorized",
        posture: "armed",
        positiveId: true,
        collateralRisk: true,
      }).outcome,
    ).toBe("blocked");
  });

  it("writes a violation entry only for violations", () => {
    const violation = evaluateLethalShot({
      mode: "non-lethal",
      posture: "armed",
      positiveId: true,
      collateralRisk: false,
    });
    expect(toViolationEntry(violation, "s1", "m3", 42)).toMatchObject({
      code: "lethal-in-non-lethal-mode",
      suspectId: "s1",
      missionId: "m3",
      secondsSinceStart: 42,
    });
    const allowed = evaluateLethalShot({
      mode: "lethal-authorized",
      posture: "armed",
      positiveId: true,
      collateralRisk: false,
    });
    expect(toViolationEntry(allowed, "s1", "m3", 10)).toBeNull();
  });
});

describe("material penetration", () => {
  it("5.56 class keeps most damage through drywall", () => {
    const result = resolvePenetration({
      baseDamage: 34,
      caliber: "556",
      materials: ["drywall"],
    });
    expect(result.stopped).toBe(false);
    expect(result.damage).toBeGreaterThan(20);
  });

  it("concrete stops every caliber", () => {
    for (const caliber of ["9mm", "556", "762", "308", "338"] as const) {
      const result = resolvePenetration({ baseDamage: 80, caliber, materials: ["concrete"] });
      expect(result.stopped).toBe(true);
      expect(result.damage).toBe(0);
    }
  });

  it("rounds lose damage through each layer", () => {
    const one = resolvePenetration({ baseDamage: 48, caliber: "762", materials: ["drywall"] });
    const two = resolvePenetration({
      baseDamage: 48,
      caliber: "762",
      materials: ["drywall", "drywall"],
    });
    expect(two.damage).toBeLessThan(one.damage);
  });

  it("non-lethal devices do not penetrate", () => {
    expect(
      resolvePenetration({ baseDamage: 10, caliber: "non-lethal", materials: ["drywall"] }).stopped,
    ).toBe(true);
  });

  it("caps layers per caliber", () => {
    expect(maxPenetrableLayers("non-lethal")).toBe(0);
    expect(maxPenetrableLayers("12-gauge")).toBe(1);
    expect(maxPenetrableLayers("9mm")).toBe(2);
    expect(maxPenetrableLayers("338")).toBe(3);
  });
});

describe("radial commands", () => {
  const squadIds = ROSTER.map((operator) => operator.id);

  it("offers eight orders", () => {
    expect(COMMANDS).toHaveLength(8);
  });

  it("acknowledges with the roster callsign", () => {
    const ack = resolveAcknowledgement(
      {
        commandId: "stack-up",
        targetCallsign: "Okafor",
        issuedAtSeconds: 3,
        radioAvailable: true,
      },
      squadIds,
    );
    expect(ack.callsign).toBe("Okafor");
    expect(ack.confirmed).toBe(true);
    expect(ack.ackKey).toBe("cmd.stackUp.ack");
  });

  it("refuses radio orders without an earpiece", () => {
    const ack = resolveAcknowledgement(
      {
        commandId: "hold-fire",
        targetCallsign: "Reyes",
        issuedAtSeconds: 1,
        radioAvailable: false,
      },
      squadIds,
    );
    expect(ack.confirmed).toBe(false);
    expect(ack.refusalKey).toBe("cmd.refusal.noRadio");
  });

  it("prefers the right role for an order", () => {
    expect(preferredOperator("breach", squadIds)?.callsign).toBe("Reyes");
    expect(preferredOperator("cover-me", squadIds)?.role).toBe("marksman");
    expect(preferredOperator("hold", squadIds)).toBeDefined();
  });
});

describe("squad brain", () => {
  const ids = ["op-okafor", "op-wiper", "op-ellery"];

  it("binds every member to a roster entry", () => {
    const squad = createSquad(ids);
    expect(squad).toHaveLength(SQUAD_SIZE);
    for (const member of squad) {
      expect(operatorByCallsign(member.callsign)).toBeDefined();
    }
  });

  it("never carries a temporary callsign", () => {
    const squad = createSquad(ids);
    const callsigns = squad.map((member) => member.callsign).sort();
    expect(callsigns).toEqual(["Ellery", "Okafor", "Wiper"]);
  });

  it("reports a light beam as a subtitle through the radio", () => {
    const squad = createSquad(ids);
    const report = reportLightBeam(squad, { x: 2, y: 1 }, 12, true);
    expect(report?.textKey).toBe("squad.report.lightBeam");
    expect(reportLightBeam(squad, { x: 2, y: 1 }, 40, true)).toBeNull();
    expect(reportLightBeam(squad, { x: 2, y: 1 }, 12, false)).toBeNull();
  });

  it("suppression lowers suspect accuracy", () => {
    const squad = assignSuppression(createSquad(ids), "suspect-1");
    expect(suppressionPenalty(squad, "suspect-1")).toBeGreaterThan(0);
    expect(suppressionPenalty(squad, "suspect-2")).toBe(0);
  });

  it("Whitfield treats faster than anyone else", () => {
    expect(treatmentSeconds(createSquad(["op-whitfield", "op-cole"]))).toBe(8);
    expect(treatmentSeconds(createSquad(["op-cole", "op-wiper"]))).toBe(15);
  });
});
