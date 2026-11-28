import type * as THREE from "three";

/** A renderable scene owned by the engine: menu, HQ, preview studio or a mission. */
export interface Controller {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  update(dt: number): void;
  resize(w: number, h: number): void;
  dispose(): void;
  pip?: THREE.PerspectiveCamera | null;
}
