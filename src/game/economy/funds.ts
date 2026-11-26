/**
 * Currency and payout rules. Funds are the single in-game currency, stored as
 * whole credits ("CR"). Guest funds live in localStorage; signed-in funds sync
 * to the server. Both paths use these same pure helpers so a price never
 * disagrees between the two.
 */

export const CURRENCY_SUFFIX = "CR";
export const STARTING_FUNDS = 2400;

/** Mission payouts by final rank. Index-free, keyed by the rank code. */
export const MISSION_PAYOUTS = {
  flawless: 3200,
  clean: 2600,
  acceptable: 1800,
  messy: 900,
} as const;

export type MissionRank = keyof typeof MISSION_PAYOUTS;

/** A lead entry or a civilian casualty subtracts from the payout. */
export const LEAD_PENALTY = 450;
export const MAX_PENALTY_FRACTION = 0.8;

export function payoutForRank(rank: MissionRank, leadEntries = 0): number {
  const base = MISSION_PAYOUTS[rank];
  const penalty = Math.min(
    base * MAX_PENALTY_FRACTION,
    Math.max(0, Math.floor(leadEntries)) * LEAD_PENALTY,
  );
  return Math.max(0, base - penalty);
}

/** Equipment is bought once. Ammunition and consumables are bought per mission. */
export function canAfford(funds: number, price: number): boolean {
  return Number.isFinite(funds) && Number.isFinite(price) && price >= 0 && funds >= price;
}

export function afterPurchase(funds: number, price: number): number {
  if (!canAfford(funds, price)) return funds;
  return funds - price;
}

/** Resale returns half the price, rounded down, and never more than was paid. */
export function resaleValue(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return 0;
  return Math.floor(price / 2);
}

export function formatFunds(funds: number): string {
  const safe = Number.isFinite(funds) ? Math.trunc(funds) : 0;
  return `${safe.toLocaleString("en-US")} ${CURRENCY_SUFFIX}`;
}
