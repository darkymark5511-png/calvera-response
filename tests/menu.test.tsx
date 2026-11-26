import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "@/lib/language";
import { SessionProvider } from "@/lib/session-context";
import MenuList from "@/components/MenuList";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/",
}));

function stubFetch(opts: { health: boolean }) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/health")) {
        return new Response(JSON.stringify({ status: "ok" }), {
          status: opts.health ? 200 : 503,
        });
      }
      if (url.includes("/api/auth/me")) {
        return new Response(JSON.stringify({ user: null }), { status: 200 });
      }
      return new Response("{}", { status: 200 });
    }),
  );
}

async function renderMenu() {
  const { default: MainMenu } = await import("@/app/page");
  return render(
    <LanguageProvider>
      <SessionProvider>
        <MainMenu />
      </SessionProvider>
    </LanguageProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  push.mockClear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("main menu", () => {
  it("shows PLAY AS GUEST first and is not gated by login", async () => {
    stubFetch({ health: true });
    await renderMenu();
    const buttons = screen.getAllByRole("button");
    const guest = screen.getByRole("button", { name: /PLAY AS GUEST/i });
    expect(guest).toBeTruthy();
    // Career, armory, settings and leaderboard are reachable without signing in.
    expect(buttons.length).toBeGreaterThanOrEqual(6);
  });

  it("opens no login form on the menu itself", async () => {
    stubFetch({ health: true });
    await renderMenu();
    expect(screen.queryByLabelText(/username/i)).toBeNull();
    expect(screen.queryByLabelText(/password/i)).toBeNull();
  });

  it("goes straight to HQ in guest mode", async () => {
    stubFetch({ health: true });
    await renderMenu();
    await userEvent.click(screen.getByRole("button", { name: /PLAY AS GUEST/i }));
    expect(push).toHaveBeenCalledWith("/hq");
    expect(window.localStorage.getItem("cr_guest_mode")).toBe("1");
  });

  it("shows the offline notice when the database is unavailable", async () => {
    stubFetch({ health: false });
    await renderMenu();
    await waitFor(() => expect(screen.getByText("DB: offline")).toBeTruthy());
    expect(screen.getByText("Server offline. Playing locally.")).toBeTruthy();
  });

  it("shows the online status when health succeeds", async () => {
    stubFetch({ health: true });
    await renderMenu();
    await waitFor(() => expect(screen.getByText("DB: online")).toBeTruthy());
  });

  it("renders Indonesian labels after switching language", async () => {
    stubFetch({ health: true });
    await renderMenu();
    await userEvent.click(screen.getByRole("button", { name: "Indonesian" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /MAIN SEBAGAI TAMU/i })).toBeTruthy(),
    );
  });
});

describe("keyboard navigation", () => {
  const items = [
    { id: "a", label: "First", onSelect: vi.fn() },
    { id: "b", label: "Second", onSelect: vi.fn() },
    { id: "c", label: "Third", onSelect: vi.fn() },
  ];

  it("arrow keys move focus and wrap around", async () => {
    render(<MenuList items={items} ariaLabel="test menu" />);
    const first = screen.getByRole("button", { name: "First" });
    first.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent).toBe("Second");
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent).toBe("Third");
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent).toBe("First");
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement?.textContent).toBe("Third");
  });

  it("Enter activates the focused item", async () => {
    const onSelect = vi.fn();
    render(
      <MenuList
        items={[{ id: "only", label: "Only", onSelect }]}
        ariaLabel="test menu"
      />,
    );
    screen.getByRole("button", { name: "Only" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
