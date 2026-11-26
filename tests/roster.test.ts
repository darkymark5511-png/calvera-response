import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ROSTER,
  ROSTER_BY_CALLSIGN,
  SQUAD_SIZE,
  operatorByCallsign,
  operatorById,
} from "@/shared/roster";
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

const allSource = sourceFiles(ROOT)
  .map((file) => ({ file, text: readFileSync(file, "utf8") }))
  .filter((entry) => !entry.file.includes(`${join("src", "i18n")}`));

const NATO = /\b(ALPHA|BRAVO|CHARLIE|DELTA|ECHO)\b/;
const TEMPORARY_NAMES = /\b(Suspect 1|Operator One|Team 1|Vanta K-9)\b/;
const REAL_BRANDS =
  /\b(Colt|Glock|Sig Sauer|SIG Sauer|Remington|Benelli|H&K|Heckler|Kalashnikov|AK-47|M4A1|MP5|Beretta|FN Herstal|Daniel Defense|Springfield|Sako|Tikka|Winchester|Mossberg|Steyr)\b/i;

describe("roster", () => {
  it("registers eight operators and a squad of three", () => {
    expect(ROSTER).toHaveLength(8);
    expect(SQUAD_SIZE).toBe(3);
  });

  it("uses unique callsigns and unique ids", () => {
    expect(new Set(ROSTER.map((operator) => operator.callsign)).size).toBe(ROSTER.length);
    expect(new Set(ROSTER.map((operator) => operator.id)).size).toBe(ROSTER.length);
  });

  it("derives the callsign from the full name", () => {
    for (const operator of ROSTER) {
      expect(operator.fullName).toContain(operator.callsign);
      expect(operator.callsign.length).toBeGreaterThan(2);
    }
  });

  it("keeps Wiper as the only nickname", () => {
    const nicknamed = ROSTER.filter((operator) => operator.fullName.includes('"'));
    expect(nicknamed).toHaveLength(1);
    expect(nicknamed[0].fullName).toBe('Simon "Wiper" Kowalczyk');
    expect(nicknamed[0].callsign).toBe("Wiper");
  });

  it("covers every role exactly once", () => {
    const roles = ROSTER.map((operator) => operator.role).sort();
    expect(roles).toEqual(
      [
        "breacher",
        "marksman",
        "medic",
        "negotiator",
        "point-man",
        "scout",
        "support-gunner",
        "technician",
      ].sort(),
    );
  });

  it("keeps every stat inside 0..100", () => {
    for (const operator of ROSTER) {
      for (const value of Object.values(operator.stats)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });

  it("resolves operators by callsign and by id, case-insensitively for callsigns", () => {
    expect(operatorById("op-reyes")?.callsign).toBe("Reyes");
    expect(operatorByCallsign("reyes")?.id).toBe("op-reyes");
    expect(operatorByCallsign("REYES")?.id).toBe("op-reyes");
    expect(ROSTER_BY_CALLSIGN.Reyes.id).toBe("op-reyes");
    expect(operatorByCallsign("Nobody")).toBeUndefined();
  });

  it("references translation keys that exist in both languages", () => {
    const read = (table: unknown, path: string): unknown =>
      path
        .split(".")
        .reduce<unknown>((acc, part) => (acc as Record<string, unknown>)[part], table);
    for (const operator of ROSTER) {
      for (const key of [
        operator.abilityKey,
        operator.abilityDescriptionKey,
        operator.roleKey,
      ]) {
        expect(typeof read(en, key), `en.${key}`).toBe("string");
        expect(typeof read(id, key), `id.${key}`).toBe("string");
      }
    }
  });
});

describe("content rules", () => {
  it("never uses a NATO alphabet word in source or strings", () => {
    const offenders = allSource.filter((entry) => NATO.test(entry.text)).map((e) => e.file);
    expect(offenders).toEqual([]);
    expect(NATO.test(JSON.stringify(en))).toBe(false);
    expect(NATO.test(JSON.stringify(id))).toBe(false);
  });

  it("never uses a temporary name", () => {
    expect(allSource.filter((entry) => TEMPORARY_NAMES.test(entry.text))).toEqual([]);
  });

  it("never names a real firearm manufacturer or model", () => {
    expect(allSource.filter((entry) => REAL_BRANDS.test(entry.text))).toEqual([]);
    expect(REAL_BRANDS.test(JSON.stringify(en))).toBe(false);
    expect(REAL_BRANDS.test(JSON.stringify(id))).toBe(false);
  });

  it("uses no exclamation marks in either language", () => {
    expect(JSON.stringify(en)).not.toContain("!");
    expect(JSON.stringify(id)).not.toContain("!");
  });

  it("keeps procedure words in English inside the Indonesian table", () => {
    const radio = JSON.stringify(id.cmd);
    for (const word of ["Copy", "Stack up", "Breach"]) {
      expect(radio, word).toContain(word);
    }
    expect(id.cmd.holdFire).toBe("Tahan tembakan");
    expect(id.cmd.wheel).toBe("Roda perintah");
  });
});
