import type { RenderSystem } from "../render/renderer";
import type { AudioEngine } from "../audio/engine";
import type { InputSystem } from "../input/input";
import type { GameStore } from "./store";
import type { CharFactory } from "../character/rig";
import type { Settings } from "./settings";

/** Everything the subsystems share. One object, passed as an argument. */
export interface GameContext {
  canvas: HTMLCanvasElement;
  render: RenderSystem;
  audio: AudioEngine;
  input: InputSystem;
  store: GameStore;
  factory: CharFactory;
  settings: () => Settings;
  t: (key: string, vars?: Record<string, string | number>) => string;
  overlay: { flash: number; nvg: boolean; damage: number; vignette: boolean };
  seq: { cmd: number; sub: number; note: number };
}
