"use client";
import dynamic from "next/dynamic";

// The game touches window, WebGL and AudioContext, so it only loads in the browser.
const GameApp = dynamic(() => import("@/game/GameApp"), { ssr: false });
export default function GameLoader() {
  return <GameApp />;
}
