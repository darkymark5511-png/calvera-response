import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "@/lib/language";
import { SessionProvider } from "@/lib/session-context";
import RosterPage from "@/app/roster/page";
import { ROSTER, SQUAD_SIZE } from "@/shared/roster";
import {
  DEFAULT_SQUAD,
  entryOrder,
  isMissionReady,
  selectionFromIds,
  squadSummary,
  toggleMember,
} from "@/shared/squad-selection";

afterEach(cleanup);

describe("squad selection", () => {
  it("fills three slots and ignores duplicates, unknown ids and overflow", () => {
    const selection = selectionFromIds([
      "op-okafor",
      "op-okafor",
      "not-a-real-id",
      "op-reyes",
      "op-whitfield",
      "op-cole",
    ]);
    expect(selection.members).toEqual(["op-okafor", "op-reyes", "op-whitfield"]);
  });

  it("toggles a member off and back on", () => {
    const start = selectionFromIds(DEFAULT_SQUAD);
    const off = toggleMember(start, "op-reyes", []);
    expect(off.members).not.toContain("op-reyes");
    const on = toggleMember(off, "op-reyes", []);
    expect(on.members).toContain("op-reyes");
  });

  it("never exceeds the squad size", () => {
    const full = selectionFromIds(DEFAULT_SQUAD);
    expect(toggleMember(full, "op-cole", []).members).toHaveLength(SQUAD_SIZE);
  });

  it("refuses an injured operator", () => {
    const start = selectionFromIds(DEFAULT_SQUAD);
    expect(toggleMember(start, "op-cole", ["op-cole"])).toBe(start);
    expect(toggleMember(start, "op-reyes", ["op-reyes"]).members).toContain("op-reyes");
  });

  it("needs at least one healthy member to deploy", () => {
    expect(isMissionReady({ members: [] }, [])).toBe(false);
    expect(
      isMissionReady(
        { members: ["op-reyes", "op-okafor"] },
        ["op-reyes", "op-okafor"],
      ),
    ).toBe(false);
    expect(isMissionReady({ members: ["op-reyes"] }, [])).toBe(true);
  });

  it("orders entry with the point man first", () => {
    const ordered = entryOrder(selectionFromIds(["op-ellery", "op-reyes", "op-okafor"]));
    expect(ordered[0].role).toBe("point-man");
    expect(squadSummary({ members: ["op-ellery", "op-reyes", "op-okafor"] })).toBe(
      "Okafor / Reyes / Ellery",
    );
  });

  it("uses only roster operators, so no temporary callsign can appear", () => {
    const ordered = entryOrder(selectionFromIds(DEFAULT_SQUAD));
    for (const operator of ordered) {
      expect(ROSTER).toContain(operator);
    }
  });
});

describe("roster screen", () => {
  it("lists all eight operators with full names and callsigns", async () => {
    render(
      <LanguageProvider>
        <SessionProvider>
          <RosterPage />
        </SessionProvider>
      </LanguageProvider>,
    );
    for (const operator of ROSTER) {
      expect(screen.getByText(operator.fullName)).toBeTruthy();
    }
    expect(screen.getAllByText("Reyes").length).toBeGreaterThan(0);
  });

  it("selects and deselects an operator", async () => {
    render(
      <LanguageProvider>
        <SessionProvider>
          <RosterPage />
        </SessionProvider>
      </LanguageProvider>,
    );
    // Reyes starts selected; a new render replaces the node after each click.
    const before = document.getElementById("roster-op-reyes") as HTMLButtonElement;
    expect(before.getAttribute("aria-pressed")).toBe("true");
    await userEvent.click(before);
    const cleared = document.getElementById("roster-op-reyes") as HTMLButtonElement;
    expect(cleared.getAttribute("aria-pressed")).toBe("false");
    await userEvent.click(cleared);
    const reselected = document.getElementById("roster-op-reyes") as HTMLButtonElement;
    expect(reselected.getAttribute("aria-pressed")).toBe("true");
  });

  it("shows ability text from the translation table", async () => {
    render(
      <LanguageProvider>
        <SessionProvider>
          <RosterPage />
        </SessionProvider>
      </LanguageProvider>,
    );
    expect(screen.getByText("Faster door breach and lower breach noise.")).toBeTruthy();
    expect(screen.getByText("Pole camera shows suspects behind walls for 6 seconds.")).toBeTruthy();
  });
});
