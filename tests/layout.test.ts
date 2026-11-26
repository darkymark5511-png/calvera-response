import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * jsdom does not run a layout engine, so the responsive contract is asserted
 * against the stylesheet itself: the brief specifies exact button heights and
 * breakpoints, and those must not drift.
 */
const css = readFileSync(
  path.resolve(__dirname, "../src/app/globals.css"),
  "utf8",
);

function block(selector: string): string {
  const index = css.indexOf(selector);
  expect(index, `missing block: ${selector}`).toBeGreaterThan(-1);
  const open = css.indexOf("{", index);
  const close = css.indexOf("}", open);
  return css.slice(open, close);
}

describe("menu stylesheet contract", () => {
  it("base buttons are 48px high in a 260px column", () => {
    const button = block(".menu-button {");
    expect(button).toMatch(/height:\s*48px/);
    const column = block(".menu-column {");
    expect(column).toMatch(/width:\s*260px/);
  });

  it("corners are 2px at most", () => {
    const radii = [...css.matchAll(/border-radius:\s*(\d+)px/g)].map((m) =>
      Number(m[1]),
    );
    expect(radii.length).toBeGreaterThan(0);
    expect(Math.max(...radii)).toBeLessThanOrEqual(2);
  });

  it("hover and focus show a 2px left accent bar and nothing else", () => {
    expect(css).toMatch(
      /\.menu-button:hover::before,\s*\.menu-button:focus-visible::before\s*\{\s*width:\s*2px/,
    );
    // No colour swap on hover/focus beyond the bar.
    const hoverRules = [...css.matchAll(/\.menu-button[^{]*:hover[^{]*\{([^}]*)\}/g)];
    for (const rule of hoverRules) {
      expect(rule[1]).not.toMatch(/background|color:/);
    }
  });

  it("portrait phones keep the stack at 52px and push it low", () => {
    expect(css).toMatch(/@media \(max-width: 560px\) and \(orientation: portrait\)/);
    const portrait = css.slice(
      css.indexOf("@media (max-width: 560px) and (orientation: portrait)"),
    );
    expect(portrait).toMatch(/\.menu-button\s*\{[^}]*height:\s*52px/);
    expect(portrait).toMatch(/\.menu-body\s*\{[^}]*align-items:\s*flex-end/);
  });

  it("landscape puts the column on the left with the title above it", () => {
    expect(css).toMatch(/@media \(max-height: 480px\) and \(orientation: landscape\)/);
    const landscape = css.slice(
      css.indexOf("@media (max-height: 480px) and (orientation: landscape)"),
    );
    expect(landscape).toMatch(/\.menu-column\s*\{[^}]*width:\s*260px/);
    // Title block precedes the menu list in the DOM.
    expect(landscape).toMatch(/\.menu-title-block\s*\{[^}]*margin-bottom/);
  });

  it("uses the specified fonts and no gradient or glow", () => {
    expect(css).toMatch(/--font-display:\s*"Barlow Condensed"/);
    expect(css).toMatch(/--font-mono:\s*"IBM Plex Mono"/);
    expect(css.toLowerCase()).not.toContain("gradient");
    expect(css.toLowerCase()).not.toContain("box-shadow: 0 0");
    expect(css.toLowerCase()).not.toContain("text-shadow");
    expect(css.toLowerCase()).not.toContain("backdrop-filter");
  });

  it("does not use pill radii anywhere", () => {
    expect(css).not.toMatch(/border-radius:\s*999/);
    expect(css).not.toMatch(/border-radius:\s*50%/);
  });
});
