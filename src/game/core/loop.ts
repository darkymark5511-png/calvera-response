import type { GameContext } from "./GameContext";
import { TICK_HZ, TICK_MS, HUD_PUSH_HZ } from "@/shared/constants";

export type SimUpdate = (ctx: GameContext, dt: number) => void;
export type RenderFn = (ctx: GameContext, alpha: number) => void;
export type HudPush = (ctx: GameContext) => void;

export class GameLoop {
  private raf = 0;
  private last = 0;
  private acc = 0;
  private hudAcc = 0;
  private running = false;
  private ctx: GameContext;
  private sim: SimUpdate;
  private render: RenderFn;
  private hud: HudPush;

  constructor(ctx: GameContext, sim: SimUpdate, render: RenderFn, hud: HudPush) {
    this.ctx = ctx;
    this.sim = sim;
    this.render = render;
    this.hud = hud;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.ctx.running = true;
    this.last = performance.now();
    this.acc = 0;
    this.hudAcc = 0;
    const frame = (now: number) => {
      if (!this.running) return;
      if (typeof document !== "undefined" && document.hidden) {
        this.last = now;
        this.raf = requestAnimationFrame(frame);
        return;
      }
      let dt = (now - this.last) / 1000;
      this.last = now;
      if (dt > 0.25) dt = 0.25;
      this.acc += dt;
      const step = 1 / TICK_HZ;
      let guards = 0;
      while (this.acc >= step && guards < 5) {
        if (!this.ctx.paused) {
          this.sim(this.ctx, step);
          this.ctx.tick += 1;
          this.ctx.timeSec += step;
        }
        this.acc -= step;
        guards += 1;
      }
      const alpha = this.acc / step;
      this.render(this.ctx, alpha);
      this.hudAcc += dt;
      if (this.hudAcc >= 1 / HUD_PUSH_HZ) {
        this.hud(this.ctx);
        this.hudAcc = 0;
      }
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  stop(): void {
    this.running = false;
    this.ctx.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  pause(): void {
    this.ctx.paused = true;
    this.ctx.hud.paused = true;
  }

  resume(): void {
    this.ctx.paused = false;
    this.ctx.hud.paused = false;
  }
}

void TICK_MS;
