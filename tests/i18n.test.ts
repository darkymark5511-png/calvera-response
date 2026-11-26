import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { id } from "@/i18n/id";
import { DEFAULT_LANG, isLang, STRINGS } from "@/i18n";

/**
 * Returns the full key path as an array. Some keys contain dots themselves
 * ("cmd.ack.none"), so the path cannot be flattened to a dotted string and
 * split again to look the value up.
 */
function paths(value: unknown, prefix: readonly string[] = []): string[][] {
  if (typeof value === "string") return [[...prefix]];
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      paths(child, [...prefix, key]),
    );
  }
  return [];
}

function read(table: unknown, path: readonly string[]): unknown {
  return path.reduce<unknown>(
    (acc, part) => (acc as Record<string, unknown>)[part],
    table,
  );
}

describe("translation tables", () => {
  it("English is the default language", () => {
    expect(DEFAULT_LANG).toBe("en");
    expect(Object.keys(STRINGS)).toEqual(["en", "id"]);
  });

  it("en and id expose exactly the same keys", () => {
    const enKeys = paths(en).map((path) => path.join(".")).sort();
    const idKeys = paths(id).map((path) => path.join(".")).sort();
    expect(idKeys).toEqual(enKeys);
  });

  it("no string is empty", () => {
    for (const [lang, table] of Object.entries(STRINGS)) {
      for (const path of paths(table)) {
        const value = read(table, path);
        expect(String(value).trim(), `${lang}.${path.join(".")}`).not.toBe("");
      }
    }
  });

  it("guest button is labelled as required in both languages", () => {
    expect(en.menu.playAsGuest).toBe("PLAY AS GUEST");
    expect(id.menu.playAsGuest).toBe("MAIN SEBAGAI TAMU");
  });

  it("offline notice exists in both languages", () => {
    expect(en.status.offlineNotice).toBe("Server offline. Playing locally.");
    expect(id.status.offlineNotice).toContain("Server offline");
  });

  it("language guard accepts only en and id", () => {
    expect(isLang("en")).toBe(true);
    expect(isLang("id")).toBe(true);
    expect(isLang("fr")).toBe(false);
    expect(isLang(null)).toBe(false);
  });
});
