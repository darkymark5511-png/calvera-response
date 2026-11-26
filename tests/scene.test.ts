import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { DRIFT_METERS_PER_SECOND, DRIFT_LIMIT_METERS } from "@/components/scene/CorridorScene";

const source = readFileSync(
  path.resolve(__dirname, "../src/components/scene/CorridorScene.tsx"),
  "utf8",
);

describe("corridor scene", () => {
  it("drifts at 0.02 m per second", () => {
    expect(DRIFT_METERS_PER_SECOND).toBe(0.02);
    expect(DRIFT_LIMIT_METERS).toBeGreaterThan(0);
  });

  it("lights the corridor with one sodium-amber directional light", () => {
    expect(source).toMatch(/DirectionalLight\(0xffa64d/);
    // Exactly one shadow-casting light.
    expect(source.match(/castShadow = true/g)?.length).toBeGreaterThan(1);
    expect(source.match(/new DirectionalLight/g)?.length).toBe(1);
  });

  it("uses hard shadows", () => {
    expect(source).toMatch(/BasicShadowMap/);
    expect(source).not.toMatch(/PCFShadowMap|VSMShadowMap/);
  });

  it("has no glow: no bloom, no emissive materials, no point lights", () => {
    expect(source).not.toMatch(/Bloom|UnrealBloomPass|EffectComposer/);
    expect(source).not.toMatch(/emissive/i);
    expect(source).not.toMatch(/PointLight|SpotLight|RectAreaLight/);
  });

  it("uses a flat background colour and matte concrete", () => {
    expect(source).toMatch(/new Color\(0x08090b\)/);
    expect(source).toMatch(/roughness: 0\.9/);
  });

  it("honours prefers-reduced-motion by not drifting", () => {
    expect(source).toMatch(/reducedMotion/);
  });

  it("degrades to a flat background when WebGL is unavailable", () => {
    expect(source).toMatch(/try \{\s*renderer = new WebGLRenderer/);
    expect(source).toMatch(/return;\s*\}\s*\n\s*const scene/);
  });
});
