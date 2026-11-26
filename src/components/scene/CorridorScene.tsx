"use client";

import { useEffect, useRef } from "react";
import {
  AmbientLight,
  BasicShadowMap,
  BoxGeometry,
  CapsuleGeometry,
  Color,
  DirectionalLight,
  Fog,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";

interface CorridorProps {
  reducedMotion?: boolean;
}

/** Slow lateral drift of the camera, as specified: 0.02 m per second. */
export const DRIFT_METERS_PER_SECOND = 0.02;
export const DRIFT_LIMIT_METERS = 0.35;

/**
 * Dim concrete corridor lit by one sodium-amber streetlight through a window.
 * Hard, matte shadows; no glow, no gradients. Purely decorative.
 */
export default function CorridorScene({ reducedMotion = false }: CorridorProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      // No WebGL (or blocked): the flat dark background in CSS stands in.
      return;
    }

    const scene = new Scene();
    scene.background = new Color(0x08090b);
    scene.fog = new Fog(0x08090b, 9, 26);

    const camera = new PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.set(0.55, 1.62, 4.2);
    camera.lookAt(0, 1.05, -1.2);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = BasicShadowMap;
    renderer.outputColorSpace = SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const concrete = new MeshStandardMaterial({
      color: 0x2b2c2e,
      roughness: 0.96,
      metalness: 0,
    });
    const concreteDark = new MeshStandardMaterial({
      color: 0x1e1f21,
      roughness: 0.98,
      metalness: 0,
    });

    // Floor and ceiling.
    const floor = new Mesh(new PlaneGeometry(12, 30), concrete);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -6);
    floor.receiveShadow = true;
    scene.add(floor);

    const ceiling = new Mesh(new PlaneGeometry(12, 30), concreteDark);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 3.1, -6);
    scene.add(ceiling);

    // Back wall.
    const back = new Mesh(new BoxGeometry(12, 3.1, 0.3), concreteDark);
    back.position.set(0, 1.55, -14);
    back.receiveShadow = true;
    scene.add(back);

    // Right wall (solid).
    const right = new Mesh(new BoxGeometry(0.3, 3.1, 30), concrete);
    right.position.set(3.2, 1.55, -6);
    right.receiveShadow = true;
    scene.add(right);

    // Left wall built around a window opening: sill, header, and two jambs.
    const windowW = 2.1;
    const windowH = 1.5;
    const windowY = 1.85;
    const windowZ = -1.6;

    const sill = new Mesh(new BoxGeometry(0.3, windowY - windowH / 2, 30), concrete);
    sill.position.set(-3.2, (windowY - windowH / 2) / 2, -6);
    sill.receiveShadow = true;
    scene.add(sill);

    const header = new Mesh(
      new BoxGeometry(0.3, 3.1 - (windowY + windowH / 2), 30),
      concrete,
    );
    header.position.set(-3.2, (3.1 + windowY + windowH / 2) / 2, -6);
    scene.add(header);

    // Wall segments at window height, in front of and behind the opening.
    const frontLength = 14 + windowZ - windowW / 2;
    const jambFront = new Mesh(
      new BoxGeometry(0.3, windowH, frontLength),
      concrete,
    );
    jambFront.position.set(-3.2, windowY, -6 + frontLength / 2);
    jambFront.receiveShadow = true;
    scene.add(jambFront);

    const backLength = 16 - (windowZ + windowW / 2);
    const jambBack = new Mesh(new BoxGeometry(0.3, windowH, backLength), concrete);
    jambBack.position.set(-3.2, windowY, -14 - backLength / 2 + backLength / 2 - backLength / 2);
    jambBack.position.z = windowZ + windowW / 2 + backLength / 2;
    scene.add(jambBack);

    // Sodium-amber streetlight outside the window.
    const streetlight = new DirectionalLight(0xffa64d, 26);
    streetlight.position.set(-11, 6.4, -1.6);
    streetlight.target.position.set(0.6, 0, -2.2);
    streetlight.castShadow = true;
    streetlight.shadow.mapSize.set(1024, 1024);
    streetlight.shadow.camera.left = -7;
    streetlight.shadow.camera.right = 7;
    streetlight.shadow.camera.top = 7;
    streetlight.shadow.camera.bottom = -7;
    streetlight.shadow.camera.near = 1;
    streetlight.shadow.camera.far = 30;
    streetlight.shadow.bias = -0.0015;
    scene.add(streetlight);
    scene.add(streetlight.target);

    scene.add(new AmbientLight(0x2a2f38, 0.35));

    // The operator: blocky, matte, anonymous.
    const operator = new Group();
    operator.position.set(0.75, 0, -1.1);
    operator.rotation.y = -0.55;

    const fatigue = new MeshStandardMaterial({
      color: 0x3a3d3a,
      roughness: 0.94,
      metalness: 0,
    });
    const gear = new MeshStandardMaterial({
      color: 0x24262a,
      roughness: 0.88,
      metalness: 0.05,
    });

    const hips = new Mesh(new BoxGeometry(0.42, 0.24, 0.26), gear);
    hips.position.y = 1.0;
    hips.castShadow = true;
    operator.add(hips);

    const torso = new Mesh(new BoxGeometry(0.52, 0.62, 0.3), gear);
    torso.position.y = 1.44;
    torso.castShadow = true;
    operator.add(torso);

    const head = new Mesh(new SphereGeometry(0.145, 20, 16), gear);
    head.position.y = 1.9;
    head.castShadow = true;
    operator.add(head);

    const helmet = new Mesh(new SphereGeometry(0.165, 20, 12, 0, Math.PI * 2, 0, 1.35), gear);
    helmet.position.y = 1.9;
    helmet.castShadow = true;
    operator.add(helmet);

    for (const side of [-1, 1]) {
      const arm = new Mesh(new CapsuleGeometry(0.072, 0.46, 4, 10), fatigue);
      arm.position.set(side * 0.34, 1.42, 0.02);
      arm.rotation.z = side * 0.09;
      arm.castShadow = true;
      operator.add(arm);

      const leg = new Mesh(new CapsuleGeometry(0.095, 0.66, 4, 10), fatigue);
      leg.position.set(side * 0.135, 0.55, 0);
      leg.castShadow = true;
      operator.add(leg);

      const boot = new Mesh(new BoxGeometry(0.15, 0.11, 0.3), gear);
      boot.position.set(side * 0.135, 0.055, 0.04);
      boot.castShadow = true;
      operator.add(boot);
    }

    // Slung rifle.
    const rifle = new Mesh(new BoxGeometry(0.055, 0.055, 0.72), gear);
    rifle.position.set(-0.06, 1.36, 0.24);
    rifle.rotation.x = -0.28;
    rifle.rotation.y = 0.22;
    rifle.castShadow = true;
    operator.add(rifle);

    scene.add(operator);

    let frame = 0;
    let running = true;
    let drift = 0;
    let direction = 1;
    let last = performance.now();
    const baseX = camera.position.x;

    const resize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const render = (now: number) => {
      if (!running) return;
      const deltaSeconds = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!reducedMotion) {
        // 0.02 m per second, reversing at the limit so the drift never stops.
        drift += direction * DRIFT_METERS_PER_SECOND * deltaSeconds;
        if (drift >= DRIFT_LIMIT_METERS) {
          drift = DRIFT_LIMIT_METERS;
          direction = -1;
        } else if (drift <= -DRIFT_LIMIT_METERS) {
          drift = -DRIFT_LIMIT_METERS;
          direction = 1;
        }
        camera.position.x = baseX + drift;
        camera.lookAt(0, 1.05, -1.2);
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        last = performance.now();
        frame = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((object) => {
        if (object instanceof Mesh) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion]);

  return <div ref={mountRef} className="scene-mount" aria-hidden="true" />;
}
