import { beforeEach, describe, expect, it } from "vitest";
import {
  EMPTY_PROGRESS,
  GUEST_FLAG_KEY,
  PROGRESS_KEY,
  parseGuestFlag,
  parseProgress,
} from "@/lib/guest";

describe("guest progress parsing", () => {
  it("returns empty progress for missing or invalid data", () => {
    expect(parseProgress(null)).toBe(EMPTY_PROGRESS);
    expect(parseProgress("not json")).toBe(EMPTY_PROGRESS);
    expect(parseProgress("{}")).toEqual({
      missionsCompleted: 0,
      bestRank: null,
      funds: 0,
      updatedAt: "",
    });
  });

  it("reads stored progress", () => {
    const raw = JSON.stringify({
      missionsCompleted: 3,
      bestRank: "B",
      funds: 1200,
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(parseProgress(raw)).toEqual({
      missionsCompleted: 3,
      bestRank: "B",
      funds: 1200,
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("ignores wrongly typed fields instead of trusting them", () => {
    const raw = JSON.stringify({
      missionsCompleted: "many",
      funds: null,
      bestRank: 7,
    });
    expect(parseProgress(raw)).toEqual({
      missionsCompleted: 0,
      bestRank: null,
      funds: 0,
      updatedAt: "",
    });
  });

  it("returns a stable reference so snapshots do not churn", () => {
    expect(parseProgress(null)).toBe(parseProgress("broken"));
  });
});

describe("guest flag", () => {
  it("only the literal '1' counts as guest mode", () => {
    expect(parseGuestFlag("1")).toBe(true);
    expect(parseGuestFlag("0")).toBe(false);
    expect(parseGuestFlag("true")).toBe(false);
    expect(parseGuestFlag(null)).toBe(false);
  });

  it("stores guest state under a device-only key", () => {
    expect(GUEST_FLAG_KEY).toBe("cr_guest_mode");
    expect(PROGRESS_KEY).toBe("cr_guest_progress");
    // Neither key is ever read by the server: guests never sync.
    expect(GUEST_FLAG_KEY.startsWith("cr_")).toBe(true);
  });
});

describe("localStorage availability", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("accepts writes and reads back", () => {
    window.localStorage.setItem(PROGRESS_KEY, "{}");
    expect(window.localStorage.getItem(PROGRESS_KEY)).toBe("{}");
  });
});
