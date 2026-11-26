import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "@/lib/language";
import { SessionProvider } from "@/lib/session-context";
import ArmoryPage from "@/app/armory/page";
import Headquarters from "@/app/hq/page";
import CareerPage from "@/app/career/page";
import { CAREER_KEY } from "@/lib/guest";
import { EMPTY_CAREER, emptyCareer, serialiseCareer } from "@/game/hq/progress";

function stubFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(JSON.stringify({ user: null, status: "ok" }), { status: 200 }),
    ),
  );
}

function wrapper(ui: React.ReactElement) {
  return (
    <LanguageProvider>
      <SessionProvider>{ui}</SessionProvider>
    </LanguageProvider>
  );
}

function seedCareer(
  funds: number,
  owned: string[] = [],
  loadout: Record<string, string> = {},
) {
  window.localStorage.setItem(
    CAREER_KEY,
    serialiseCareer({
      ...emptyCareer(),
      funds,
      owned,
      loadout: { ...emptyCareer().loadout, ...loadout },
    }),
  );
}

/** The catalogue card for an item, skipping the loadout summary rows. */
function cardFor(name: string): HTMLElement {
  for (const node of screen.getAllByText(name)) {
    const card = node.closest("li");
    if (card) return card as HTMLElement;
  }
  throw new Error(`no catalogue card for ${name}`);
}

beforeEach(() => {
  window.localStorage.clear();
  stubFetch();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe("armory", () => {
  it("shows the starting funds and the default loadout", async () => {
    await render(wrapper(<ArmoryPage />));
    expect(screen.getByText(/Funds: 2,400 CR/)).toBeTruthy();
    // Only the primary slot is filled by default, so every other row is empty.
    expect(screen.getAllByText("Empty")).toHaveLength(9);
  });

  it("lists a slot only when it is selected", async () => {
    await render(wrapper(<ArmoryPage />));
    expect(screen.getAllByText("Vantor VK-4 Carbine").length).toBeGreaterThan(0);
    expect(screen.queryByText("Halvard HV-45 Sidearm")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Secondary" }));
    expect(screen.getByText("Halvard HV-45 Sidearm")).toBeTruthy();
  });

  it("buys an item and deducts the price", async () => {
    await render(wrapper(<ArmoryPage />));
    await userEvent.click(screen.getByRole("button", { name: "Secondary" }));
    await userEvent.click(within(cardFor("Halvard HV-45 Sidearm")).getByRole("button"));
    expect(screen.getByText(/Funds: 2,000 CR/)).toBeTruthy();
    expect(screen.getByText("Purchased.")).toBeTruthy();
    const stored = JSON.parse(window.localStorage.getItem(CAREER_KEY) ?? "{}") as {
      owned: string[];
    };
    expect(stored.owned).toContain("hv-pistol");
  });

  it("refuses a purchase that costs more than the balance", async () => {
    seedCareer(100);
    await render(wrapper(<ArmoryPage />));
    await userEvent.click(within(cardFor("Vantor VK-4 Carbine")).getByRole("button"));
    expect(screen.getByText("Not enough funds.")).toBeTruthy();
  });

  it("equips an owned item and shows it in the loadout", async () => {
    seedCareer(2400, ["hv-pistol"]);
    await render(wrapper(<ArmoryPage />));
    await userEvent.click(screen.getByRole("button", { name: "Secondary" }));
    await userEvent.click(screen.getByRole("button", { name: "Equip" }));
    const rows = screen.getAllByRole("definition");
    expect(rows.some((row) => row.textContent === "Halvard HV-45 Sidearm")).toBe(true);
  });

  it("shows the unlock count and disables the buy button for a locked item", async () => {
    await render(wrapper(<ArmoryPage />));
    const card = cardFor("Brennock BR-338 Long Rifle");
    expect(within(card).getByText("Unlocks after 5 missions.")).toBeTruthy();
    const locked = within(card).getByRole("button");
    expect(locked.textContent).toBe("Locked");
    expect((locked as HTMLButtonElement).disabled).toBe(true);
  });

  it("sells an owned item back at half price", async () => {
    seedCareer(0, ["hv-pistol"]);
    await render(wrapper(<ArmoryPage />));
    await userEvent.click(screen.getByRole("button", { name: "Secondary" }));
    await userEvent.click(screen.getByRole("button", { name: /Sell/ }));
    expect(screen.getByText(/Funds: 200 CR/)).toBeTruthy();
    expect(screen.getByText("Sold back.")).toBeTruthy();
  });
});

describe("headquarters", () => {
  it("shows a guest career without a login gate", async () => {
    await render(wrapper(<Headquarters />));
    expect(screen.getByText(/Guest career/)).toBeTruthy();
    expect(screen.getByText("2,400 CR")).toBeTruthy();
    expect(screen.getByText("Open armory")).toBeTruthy();
    expect(screen.getByText("Open training range")).toBeTruthy();
  });

  it("reads the saved career", async () => {
    seedCareer(900, ["vt-carbine", "iw-plate"], { armor: "iw-plate" });
    await render(wrapper(<Headquarters />));
    expect(screen.getByText("900 CR")).toBeTruthy();
    expect(screen.getByText("Ironwood IW-2 Plate Carrier")).toBeTruthy();
  });
});

describe("career", () => {
  it("starts with no data and can be dispatched", async () => {
    await render(wrapper(<CareerPage />));
    expect(screen.getByText(/No career data yet/)).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: /Dispatch next mission/ }));
    expect(screen.getByText(/Mission 1: 1,800 CR/)).toBeTruthy();
    const stored = JSON.parse(window.localStorage.getItem(CAREER_KEY) ?? "{}") as {
      missionsCompleted: number;
      funds: number;
    };
    expect(stored.missionsCompleted).toBe(1);
    expect(stored.funds).toBe(EMPTY_CAREER.funds + 1800);
  });

  it("shows the payout table", async () => {
    await render(wrapper(<CareerPage />));
    expect(screen.getByText("Flawless")).toBeTruthy();
    expect(screen.getByText("3,200 CR")).toBeTruthy();
  });
});
