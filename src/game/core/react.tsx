"use client";
import { createContext, useCallback, useContext } from "react";
import type { ReactNode } from "react";
import { useStore } from "zustand";
import type { Engine } from "./engine";
import type { GameStore, UiState } from "./store";
import { tr } from "@/shared/i18n";

interface Ctx { engine: Engine; store: GameStore }
const GameReact = createContext<Ctx | null>(null);

export function GameProvider({ engine, store, children }: { engine: Engine; store: GameStore; children: ReactNode }) {
  return <GameReact.Provider value={{ engine, store }}>{children}</GameReact.Provider>;
}
export function useEngine(): Engine {
  const c = useContext(GameReact);
  if (!c) throw new Error("GameProvider missing");
  return c.engine;
}
export function useUi<T>(sel: (s: UiState) => T): T {
  const c = useContext(GameReact);
  if (!c) throw new Error("GameProvider missing");
  return useStore(c.store, sel);
}
export function useStoreApi(): GameStore {
  const c = useContext(GameReact);
  if (!c) throw new Error("GameProvider missing");
  return c.store;
}
export type TFn = (key: string, vars?: Record<string, string | number>) => string;
export function useT(): TFn {
  const lang = useUi((s) => s.lang);
  return useCallback((k: string, v?: Record<string, string | number>) => tr(lang, k, v), [lang]);
}
