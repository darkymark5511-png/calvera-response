import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "@/lib/language";
import { SessionProvider } from "@/lib/session-context";
import { lookup, translator } from "@/i18n/lookup";
import { en } from "@/i18n/en";
import { id } from "@/i18n/id";
import {
  createRange,
  fire,
  issueRangeCommand,
  laserOnBody,
  lightBeamVisible,
  RANGE_SQUAD_IDS,
  SMOKE_SECONDS,
  stepRange,
} from "@/game/world/range";
import RangePage from "@/app/range/page";

function stubFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/health")) {
        return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
      }
      return new Response(JSON.stringify({ user: null }), { status: 200 });
    }),
  );
}

async function renderRange() {
  return render(
    <LanguageProvider>
      <SessionProvider>
        <RangePage />
      </SessionProvider>
    </LanguageProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe("translation lookup", () => {
  it("resolves nested keys", () => {
    expect(lookup(en, "range.heading")).toBe("Training Range");
    expect(lookup(id, "range.heading")).toBe("Lapangan Latihan");
  });

  it("resolves keys whose property name contains a dot", () => {
    expect(lookup(en, "cmd.holdFire.ack")).toBe("Copy, holding fire.");
    expect(lookup(id, "cmd.ack.none")).toBe("Tidak ada balasan.");
    expect(lookup(en, "roster.ability.reyesDesc")).toContain("breach");
  });

  it("interpolates values", () => {
    const translate = translator(en);
    expect(translate("squad.report.lightBeam", { callsign: "Okafor" })).toBe(
      "Okafor: Copy, light on the north side.",
    );
  });

  it("returns the key when it is missing instead of throwing", () => {
    expect(lookup(en, "range.unknown.key")).toBe("range.unknown.key");
  });
});

describe("range state", () => {
  it("starts with a three-operator squad bound to roster ids", () => {
    const state = createRange();
    expect(state.squad).toHaveLength(3);
    expect(state.squad.map((member) => member.operatorId)).toEqual([...RANGE_SQUAD_IDS]);
    expect(state.squad.every((member) => member.callsign.length > 0)).toBe(true);
  });

  it("does not advance without time", () => {
    const state = createRange();
    expect(stepRange(state, 0)).toBe(state);
  });

  it("lights the beam only when the weapon light is on", () => {
    const state = createRange();
    expect(lightBeamVisible(state)).toBe(false);
    const lit = { ...state, player: { ...state.player, lightOn: true } };
    expect(laserOnBody(lit)).toBe(true);
    expect(lightBeamVisible(lit)).toBe(true);
  });

  it("escalates a suspect who sees the light beam", () => {
    const state = { ...createRange(), player: { ...createRange().player, lightOn: true } };
    const next = stepRange(state, 0.5);
    expect(next.suspect.awareness).toBeGreaterThan(0);
    expect(next.suspect.state).not.toBe("idle");
  });

  it("holds the suspect at idle in the dark with the light off", () => {
    const state = { ...createRange(), roomLight: 0.02 };
    const next = stepRange(state, 3);
    expect(next.suspect.awareness).toBe(0);
    expect(next.suspect.state).toBe("idle");
  });

  it("smoke clears itself after its lifetime", () => {
    const state = { ...createRange(), smokeSeconds: SMOKE_SECONDS };
    const next = stepRange(state, SMOKE_SECONDS);
    expect(next.smokeSeconds).toBe(0);
  });

  it("a shot on an unaware suspect is a lead entry", () => {
    const state = createRange();
    const result = fire(state);
    expect(result.verdict?.outcome).toBe("violation");
    expect(result.state.violations).toBe(1);
    expect(result.state.alerts).toHaveLength(1);
  });

  it("a shot on an alerted suspect is allowed and costs health", () => {
    const base = createRange();
    const alert = {
      ...base,
      suspect: { ...base.suspect, state: "alerted" as const, awareness: 60 },
    };
    const result = fire(alert);
    expect(result.verdict?.outcome).toBe("allowed");
    expect(result.state.violations).toBe(0);
    expect(result.state.suspect.health).toBeLessThan(100);
  });

  it("issues a radial order and records the acknowledgement", () => {
    const state = issueRangeCommand(createRange(), 2);
    expect(state.feed).toHaveLength(1);
    expect(state.feed[0].textKey).toBe("cmd.stackUp.ack");
    expect(state.feed[0].callsign.length).toBeGreaterThan(0);
  });

  it("moves the ordered operator into a task", () => {
    const state = issueRangeCommand(createRange(), 3);
    const breaching = state.squad.filter((member) => member.task === "breaching");
    expect(breaching).toHaveLength(1);
  });
});

describe("range screen", () => {
  it("renders the awareness meter and the squad", async () => {
    stubFetch();
    await renderRange();
    expect(screen.getByRole("meter", { name: /Awareness/i })).toBeTruthy();
    for (const callsign of ["Okafor", "Whitfield", "Ellery"]) {
      expect(screen.getByText(callsign)).toBeTruthy();
    }
  });

  it("renders all eight orders", async () => {
    stubFetch();
    await renderRange();
    for (const id of [
      "move-up",
      "cover-me",
      "stack-up",
      "breach",
      "hold",
      "flash-out",
      "hold-fire",
      "search",
    ]) {
      expect(document.getElementById(`order-${id}`)).toBeTruthy();
    }
  });

  it("acknowledges an order on click", async () => {
    stubFetch();
    await renderRange();
    await userEvent.click(screen.getByRole("button", { name: "Stack up" }));
    expect(screen.getByText(/Copy, stacking up/)).toBeTruthy();
  });

  it("records a lead entry after firing", async () => {
    stubFetch();
    await renderRange();
    await userEvent.click(screen.getByRole("button", { name: "Fire" }));
    expect(screen.getByText(/Lead: lethal shot without positive identification/)).toBeTruthy();
  });

  it("runs the simulation while the range is open", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    stubFetch();
    await renderRange();
    await userEvent.click(screen.getByRole("button", { name: /Open range/i }));
    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByText(/Time on range: 0\./)).toBeTruthy();
    vi.useRealTimers();
  });

  it("resets the range", async () => {
    stubFetch();
    await renderRange();
    await userEvent.click(screen.getByRole("button", { name: "Fire" }));
    await userEvent.click(screen.getByRole("button", { name: /Reset range/i }));
    expect(screen.queryByText(/Lead: lethal shot/)).toBeNull();
  });
});
