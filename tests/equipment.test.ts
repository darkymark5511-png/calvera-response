import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CATALOG,
  CATALOG_BY_ID,
  MANUFACTURERS,
  SLOT_ORDER,
  loadoutValue,
  perMissionCost,
  type Loadout,
} from "@/game/equipment/catalog";
import {
  MAX_LOAD,
  loadoutEffects,
  loadoutWeight,
  mobilityFactor,
  validateLoadout,
} from "@/game/equipment/loadout";
import {
  LEAD_PENALTY,
  MISSION_PAYOUTS,
  STARTING_FUNDS,
  afterPurchase,
  canAfford,
  formatFunds,
  payoutForRank,
  resaleValue,
} from "@/game/economy/funds";
import {
  CAREER_VERSION,
  EMPTY_CAREER,
  applyMissionResult,
  emptyCareer,
  nextMissionIndex,
  parseCareer,
  serialiseCareer,
} from "@/game/hq/progress";
import { en } from "@/i18n/en";
import { id } from "@/i18n/id";

const ROOT = join(process.cwd(), "src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return full.endsWith(".ts") || full.endsWith(".tsx") ? [full] : [];
  });
}

const allSource = sourceFiles(ROOT).map((file) => ({ file, text: readFileSync(file, "utf8") }));

describe("catalogue", () => {
  it("has unique ids and unique names", () => {
    expect(new Set(CATALOG.map((item) => item.id)).size).toBe(CATALOG.length);
    expect(new Set(CATALOG.map((item) => item.name)).size).toBe(CATALOG.length);
  });

  it("uses only approved fictional manufacturers", () => {
    for (const item of CATALOG) {
      expect(MANUFACTURERS).toContain(item.manufacturer);
    }
  });

  it("covers every slot in the slot order", () => {
    const slots = new Set(CATALOG.map((item) => item.slot));
    for (const slot of slots) {
      expect(SLOT_ORDER).toContain(slot);
    }
  });

  it("prices are positive whole credits", () => {
    for (const item of CATALOG) {
      expect(Number.isInteger(item.price)).toBe(true);
      expect(item.price).toBeGreaterThan(0);
    }
  });

  it("only weapons carry a caliber", () => {
    for (const item of CATALOG) {
      if (item.itemClass === "weapon") expect(item.caliber).toBeDefined();
      else expect(item.caliber).toBeUndefined();
    }
  });

  it("consumables are the only per-mission items", () => {
    for (const item of CATALOG) {
      if (item.perMission) expect(item.itemClass).toBe("consumable");
    }
  });

  it("every item has a note in both languages", () => {
    for (const item of CATALOG) {
      const key = item.id as keyof typeof en.armory.item;
      expect(en.armory.item[key]?.note, `en ${item.id}`).toBeTruthy();
      expect(id.armory.item[key]?.note, `id ${item.id}`).toBeTruthy();
    }
  });

  it("looks items up by id", () => {
    expect(CATALOG_BY_ID["vt-carbine"].manufacturer).toBe("Vantor");
    expect(CATALOG_BY_ID["not-an-item"]).toBeUndefined();
  });
});

describe("manufacturer rules", () => {
  it("never names a real firearm brand anywhere in source", () => {
    const realBrands =
      /\b(Colt|Glock|Sig Sauer|SIG Sauer|Remington|Benelli|Heckler|Kalashnikov|AK-47|M4A1|MP5|Beretta|FN Herstal|Daniel Defense|Springfield|Sako|Tikka|Winchester|Mossberg|Steyr)\b/i;
    for (const entry of allSource) {
      expect(realBrands.test(entry.text), entry.file).toBe(false);
    }
  });

  it("uses every approved manufacturer at least once", () => {
    const used = new Set(CATALOG.map((item) => item.manufacturer));
    for (const manufacturer of MANUFACTURERS) {
      expect(used, manufacturer).toContain(manufacturer);
    }
  });

  it("no real weapon model number collides with a fictional one", () => {
    const models = CATALOG.map((item) => item.name);
    expect(models).not.toContain("M4A1");
    for (const name of models) {
      expect(MANUFACTURERS.some((m) => name.startsWith(m))).toBe(true);
    }
  });
});

describe("loadout", () => {
  const full: Loadout = {
    primary: "vt-carbine",
    secondary: "hv-pistol",
    optic: "sp-scope",
    armor: "iw-plate",
    helmet: "hf-helmet",
    "night-vision": "is-goggles",
    utility: "tq-polecam",
  };

  it("accepts a valid loadout", () => {
    expect(
      validateLoadout(
        full,
        ["vt-carbine", "hv-pistol", "sp-scope", "iw-plate", "hf-helmet", "is-goggles", "tq-polecam"],
        10,
      ),
    ).toEqual([]);
  });

  it("rejects an unknown item", () => {
    expect(validateLoadout({ primary: "nope" }, [], 10)).toEqual([
      { slot: "primary", code: "unknown-item" },
    ]);
  });

  it("rejects an item in the wrong slot", () => {
    expect(validateLoadout({ primary: "hv-pistol" }, ["hv-pistol"], 10)).toEqual([
      { slot: "primary", code: "wrong-slot" },
    ]);
  });

  it("rejects a locked or unowned item", () => {
    expect(validateLoadout({ primary: "br-bolt" }, ["br-bolt"], 0)).toEqual([
      { slot: "primary", code: "locked" },
    ]);
    expect(validateLoadout({ primary: "vt-carbine" }, [], 5)).toEqual([
      { slot: "primary", code: "locked" },
    ]);
  });

  it("allows a per-mission consumable without ownership", () => {
    expect(validateLoadout({ throwable: "bv-flash" }, [], 0)).toEqual([]);
  });

  it("stacks armor and helmet but caps at 60%", () => {
    const effects = loadoutEffects(full);
    expect(effects.damageReduction).toBeGreaterThan(0.5);
    expect(effects.damageReduction).toBeLessThanOrEqual(0.6);
  });

  it("reports the special tools a loadout carries", () => {
    const effects = loadoutEffects(full);
    expect(effects.hasNightVision).toBe(true);
    expect(effects.hasPoleCamera).toBe(true);
    expect(effects.hasWedge).toBe(false);
    expect(effects.opticBonus).toBeCloseTo(0.2, 5);
  });

  it("never exceeds the load cap and slows down near it", () => {
    expect(loadoutWeight(full)).toBeLessThanOrEqual(MAX_LOAD);
    expect(mobilityFactor({})).toBe(1);
    expect(mobilityFactor(full)).toBeLessThan(1);
  });

  it("sums kit value and repurchase cost separately", () => {
    expect(loadoutValue(full)).toBe(
      1200 + 400 + 620 + 980 + 540 + 1400 + 450,
    );
    expect(perMissionCost(full)).toBe(0);
    expect(perMissionCost({ throwable: "bv-flash", medical: "tq-bandage" })).toBe(90 + 150);
  });
});

describe("funds", () => {
  it("starts every career with credits", () => {
    expect(STARTING_FUNDS).toBeGreaterThan(0);
    expect(emptyCareer().funds).toBe(STARTING_FUNDS);
  });

  it("pays by rank and subtracts lead entries", () => {
    expect(payoutForRank("flawless")).toBe(MISSION_PAYOUTS.flawless);
    expect(payoutForRank("clean", 1)).toBe(MISSION_PAYOUTS.clean - LEAD_PENALTY);
  });

  it("caps the lead penalty at 80% instead of paying nothing", () => {
    expect(payoutForRank("messy", 99)).toBe(Math.round(MISSION_PAYOUTS.messy * 0.2));
    expect(payoutForRank("flawless", 1)).toBeGreaterThan(0);
    expect(payoutForRank("flawless", -3)).toBe(MISSION_PAYOUTS.flawless);
  });

  it("checks affordability before spending", () => {
    expect(canAfford(500, 500)).toBe(true);
    expect(canAfford(499, 500)).toBe(false);
    expect(afterPurchase(500, 500)).toBe(0);
    expect(afterPurchase(400, 500)).toBe(400);
    expect(canAfford(Number.NaN, 10)).toBe(false);
  });

  it("resells at half price", () => {
    expect(resaleValue(1200)).toBe(600);
    expect(resaleValue(91)).toBe(45);
    expect(resaleValue(0)).toBe(0);
  });

  it("formats credits with the CR suffix", () => {
    expect(formatFunds(2400)).toBe("2,400 CR");
    expect(formatFunds(Number.NaN)).toBe("0 CR");
  });
});

describe("career state", () => {
  it("starts empty with a default loadout and the current version", () => {
    const career = emptyCareer();
    expect(career.missionsCompleted).toBe(0);
    expect(career.loadout.primary).toBe("vt-carbine");
    expect(career.version).toBe(CAREER_VERSION);
    expect(EMPTY_CAREER.funds).toBe(STARTING_FUNDS);
  });

  it("round-trips through JSON", () => {
    const career = emptyCareer("2026-01-01T00:00:00.000Z");
    expect(parseCareer(serialiseCareer(career))).toEqual(career);
  });

  it("treats a corrupt save as empty instead of throwing", () => {
    expect(parseCareer("{not json")).toBe(EMPTY_CAREER);
    expect(parseCareer(null)).toBe(EMPTY_CAREER);
    expect(parseCareer([1, 2, 3])).toBe(EMPTY_CAREER);
  });

  it("sanitises absurd values", () => {
    const parsed = parseCareer({
      missionsCompleted: -5,
      funds: -100,
      owned: [1, "vt-carbine", null],
      leadEntries: "many",
    });
    expect(parsed.missionsCompleted).toBe(0);
    expect(parsed.funds).toBe(0);
    expect(parsed.owned).toEqual(["vt-carbine"]);
    expect(parsed.leadEntries).toBe(0);
  });

  it("applies a mission result once and keeps the first best rank", () => {
    const started = emptyCareer();
    const after = applyMissionResult(started, {
      missionIndex: 1,
      rank: "clean",
      payout: 2600,
      leadEntries: 1,
      now: "2026-01-01T00:00:00.000Z",
    });
    expect(after.missionsCompleted).toBe(1);
    expect(after.funds).toBe(STARTING_FUNDS + 2600);
    expect(after.bestRanks["1"]).toBe("clean");
    expect(after.leadEntries).toBe(1);
    expect(nextMissionIndex(after)).toBe(2);

    const again = applyMissionResult(after, {
      missionIndex: 1,
      rank: "messy",
      payout: 900,
      leadEntries: 0,
      now: "2026-01-02T00:00:00.000Z",
    });
    expect(again.bestRanks["1"]).toBe("clean");
  });
});
