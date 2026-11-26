"use client";

/**
 * Guest progress lives in localStorage only — it is never sent to the server.
 * Only signed-in accounts sync. Read it with `useLocalProgress()`.
 */

import { useSyncExternalStore } from "react";
import { EMPTY_CAREER, parseCareer, serialiseCareer, type CareerState } from "@/game/hq/progress";

export const PROGRESS_KEY = "cr_guest_progress";
export const GUEST_FLAG_KEY = "cr_guest_mode";

export interface LocalProgress {
  missionsCompleted: number;
  bestRank: string | null;
  funds: number;
  updatedAt: string;
}

export const EMPTY_PROGRESS: LocalProgress = {
  missionsCompleted: 0,
  bestRank: null,
  funds: 0,
  updatedAt: "",
};

/**
 * One canonical empty object for "no progress". Returning the same reference
 * keeps useSyncExternalStore snapshots stable (no render loop on every poll).
 */
function emptyProgress(): LocalProgress {
  return EMPTY_PROGRESS;
}

export function parseProgress(raw: string | null): LocalProgress {
  if (!raw) return emptyProgress();
  try {
    const parsed = JSON.parse(raw) as Partial<LocalProgress>;
    return {
      missionsCompleted:
        typeof parsed.missionsCompleted === "number"
          ? parsed.missionsCompleted
          : 0,
      bestRank: typeof parsed.bestRank === "string" ? parsed.bestRank : null,
      funds: typeof parsed.funds === "number" ? parsed.funds : 0,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return emptyProgress();
  }
}

export function parseGuestFlag(raw: string | null): boolean {
  return raw === "1";
}

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Writes and notifies this tab; the `storage` event only fires cross-tab. */
export function writeStoredValue(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the session continues without persistence.
  }
  emit();
}

export function enterGuestMode(): void {
  writeStoredValue(GUEST_FLAG_KEY, "1");
}

export function leaveGuestMode(): void {
  writeStoredValue(GUEST_FLAG_KEY, null);
}

// Snapshots must be referentially stable while the raw value is unchanged.
const cache = new Map<string, { raw: string | null; value: unknown }>();

function cached<T>(key: string, raw: string | null, parse: (r: string | null) => T): T {
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  const value = parse(raw);
  cache.set(key, { raw, value });
  return value;
}

export function useLocalProgress(): LocalProgress {
  return useSyncExternalStore(
    subscribe,
    () => cached(PROGRESS_KEY, readRaw(PROGRESS_KEY), parseProgress),
    () => EMPTY_PROGRESS,
  );
}

export function useGuestMode(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => cached(GUEST_FLAG_KEY, readRaw(GUEST_FLAG_KEY), parseGuestFlag),
    () => false,
  );
}

/* Career sync -------------------------------------------------------- */

export const CAREER_KEY = "cr_career";

/** Writes the career locally. Signed-in saves are pushed separately. */
export function writeLocalCareer(state: CareerState): void {
  writeStoredValue(CAREER_KEY, serialiseCareer(state));
}

const careerListeners = new Set<() => void>();

function emitCareer(): void {
  for (const listener of careerListeners) listener();
}

function subscribeCareer(listener: () => void): () => void {
  careerListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    careerListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/**
 * Career state with a separate listener set from the legacy progress keys, so
 * writing a career does not re-render every guest-progress consumer.
 */
export function useCareer(): CareerState {
  return useSyncExternalStore(
    subscribeCareer,
    () => cached(CAREER_KEY, readRaw(CAREER_KEY), parseCareer),
    () => EMPTY_CAREER,
  );
}

export function updateCareer(update: (current: CareerState) => CareerState): CareerState {
  const current = cached(CAREER_KEY, readRaw(CAREER_KEY), parseCareer);
  const next = update(current);
  writeStoredValue(CAREER_KEY, serialiseCareer(next));
  emitCareer();
  return next;
}
