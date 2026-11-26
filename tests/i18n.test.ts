import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { id } from "@/i18n/id";
import { DEFAULT_LANG, isLang, STRINGS } from "@/i18n";

function flatten(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return [prefix];
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      flatten(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

describe("translation tables", () => {
  it("English is the default language", () => {
    expect(DEFAULT_LANG).toBe("en");
    expect(Object.keys(STRINGS)).toEqual(["en", "id"]);
  });

  it("en and id expose exactly the same keys", () => {
    const enKeys = flatten(en).sort();
    const idKeys = flatten(id).sort();
    expect(idKeys).toEqual(enKeys);
  });

  it("no string is empty", () => {
    for (const [lang, table] of Object.entries(STRINGS)) {
      for (const key of flatten(table)) {
        const value = key
          .split(".")
          .reduce<unknown>(
            (acc, part) => (acc as Record<string, unknown>)[part],
            table,
          );
        expect(String(value).trim(), `${lang}.${key}`).not.toBe("");
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
