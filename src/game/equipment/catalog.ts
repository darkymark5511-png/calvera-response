/**
 * Equipment catalogue. Every manufacturer is fictional and drawn from the
 * approved list; no real firearm brand or model name appears anywhere.
 *
 * Prices are in whole credits. A weapon is bought once and kept; ammunition
 * and consumables are bought per mission, so they carry a `perMission` flag.
 */

import type { CaliberClass } from "../combat/penetration";

export const MANUFACTURERS = [
  "Vantor",
  "Harlan",
  "Corvane",
  "Ridgemont",
  "Brennock",
  "Halvard",
  "Quarrel Works",
  "Sallow Precision",
  "Ironwood",
  "Hollow Forge",
  "Ironside",
  "Marshal",
  "Tamarack",
  "Brennan Vale",
  "Torque",
] as const;

export type Manufacturer = (typeof MANUFACTURERS)[number];

export type EquipmentSlot =
  | "primary"
  | "secondary"
  | "armor"
  | "helmet"
  | "night-vision"
  | "breaching"
  | "throwable"
  | "medical"
  | "optic"
  | "utility";

export type EquipmentClass = "weapon" | "protection" | "tool" | "consumable" | "attachment";

export interface EquipmentItem {
  id: string;
  /** Translation key, resolved from `armory.item.<id>` and `armory.item.<id>.note`. */
  manufacturer: Manufacturer;
  slot: EquipmentSlot;
  itemClass: EquipmentClass;
  price: number;
  /** Consumables are repurchased for every mission. */
  perMission: boolean;
  /** Weapon caliber class, for the penetration table. Weapons only. */
  caliber?: CaliberClass;
  /** Unlock requirement: career missions completed. */
  unlockAfterMissions: number;
  /** Localised display name is a proper noun, so it is not translated. */
  name: string;
}

export const CATALOG: readonly EquipmentItem[] = [
  {
    id: "vt-carbine",
    name: "Vantor VK-4 Carbine",
    manufacturer: "Vantor",
    slot: "primary",
    itemClass: "weapon",
    price: 1200,
    perMission: false,
    caliber: "556",
    unlockAfterMissions: 0,
  },
  {
    id: "hl-subgun",
    name: "Harlan HX-9 Subgun",
    manufacturer: "Harlan",
    slot: "primary",
    itemClass: "weapon",
    price: 900,
    perMission: false,
    caliber: "9mm",
    unlockAfterMissions: 0,
  },
  {
    id: "cv-shotgun",
    name: "Corvane C-12 Breacher",
    manufacturer: "Corvane",
    slot: "primary",
    itemClass: "weapon",
    price: 1050,
    perMission: false,
    caliber: "12-gauge",
    unlockAfterMissions: 1,
  },
  {
    id: "rg-dmr",
    name: "Ridgemont RG-7 Marksman",
    manufacturer: "Ridgemont",
    slot: "primary",
    itemClass: "weapon",
    price: 1850,
    perMission: false,
    caliber: "762",
    unlockAfterMissions: 3,
  },
  {
    id: "br-bolt",
    name: "Brennock BR-338 Long Rifle",
    manufacturer: "Brennock",
    slot: "primary",
    itemClass: "weapon",
    price: 2600,
    perMission: false,
    caliber: "338",
    unlockAfterMissions: 5,
  },
  {
    id: "hv-pistol",
    name: "Halvard HV-45 Sidearm",
    manufacturer: "Halvard",
    slot: "secondary",
    itemClass: "weapon",
    price: 400,
    perMission: false,
    caliber: "45",
    unlockAfterMissions: 0,
  },
  {
    id: "qw-dart",
    name: "Quarrel Works QD-1 Dart Projector",
    manufacturer: "Quarrel Works",
    slot: "secondary",
    itemClass: "weapon",
    price: 760,
    perMission: false,
    caliber: "non-lethal",
    unlockAfterMissions: 1,
  },
  {
    id: "sp-scope",
    name: "Sallow Precision SP-3 Optic",
    manufacturer: "Sallow Precision",
    slot: "optic",
    itemClass: "attachment",
    price: 620,
    perMission: false,
    unlockAfterMissions: 1,
  },
  {
    id: "iw-plate",
    name: "Ironwood IW-2 Plate Carrier",
    manufacturer: "Ironwood",
    slot: "armor",
    itemClass: "protection",
    price: 980,
    perMission: false,
    unlockAfterMissions: 0,
  },
  {
    id: "hf-helmet",
    name: "Hollow Forge HF-1 Helmet",
    manufacturer: "Hollow Forge",
    slot: "helmet",
    itemClass: "protection",
    price: 540,
    perMission: false,
    unlockAfterMissions: 0,
  },
  {
    id: "is-goggles",
    name: "Ironside IS-2 Night Vision",
    manufacturer: "Ironside",
    slot: "night-vision",
    itemClass: "protection",
    price: 1400,
    perMission: false,
    unlockAfterMissions: 2,
  },
  {
    id: "ms-ram",
    name: "Marshal MR-5 Ram",
    manufacturer: "Marshal",
    slot: "breaching",
    itemClass: "tool",
    price: 300,
    perMission: false,
    unlockAfterMissions: 0,
  },
  {
    id: "tm-charge",
    name: "Tamarack TC-2 Breach Charge",
    manufacturer: "Tamarack",
    slot: "breaching",
    itemClass: "consumable",
    price: 120,
    perMission: true,
    unlockAfterMissions: 0,
  },
  {
    id: "bv-flash",
    name: "Brennan Vale BV-4 Flashbang",
    manufacturer: "Brennan Vale",
    slot: "throwable",
    itemClass: "consumable",
    price: 90,
    perMission: true,
    unlockAfterMissions: 0,
  },
  {
    id: "bv-smoke",
    name: "Brennan Vale BV-6 Smoke",
    manufacturer: "Brennan Vale",
    slot: "throwable",
    itemClass: "consumable",
    price: 70,
    perMission: true,
    unlockAfterMissions: 0,
  },
  {
    id: "tq-bandage",
    name: "Torque TQ-8 Trauma Kit",
    manufacturer: "Torque",
    slot: "medical",
    itemClass: "consumable",
    price: 150,
    perMission: true,
    unlockAfterMissions: 0,
  },
  {
    id: "tq-polecam",
    name: "Torque TQ-3 Pole Camera",
    manufacturer: "Torque",
    slot: "utility",
    itemClass: "tool",
    price: 450,
    perMission: false,
    unlockAfterMissions: 1,
  },
  {
    id: "qw-wedge",
    name: "Quarrel Works QW-6 Door Wedge",
    manufacturer: "Quarrel Works",
    slot: "utility",
    itemClass: "tool",
    price: 180,
    perMission: false,
    unlockAfterMissions: 0,
  },
] as const;

export const CATALOG_BY_ID: Readonly<Record<string, EquipmentItem>> = Object.fromEntries(
  CATALOG.map((item) => [item.id, item]),
);

export const SLOT_ORDER: readonly EquipmentSlot[] = [
  "primary",
  "secondary",
  "optic",
  "armor",
  "helmet",
  "night-vision",
  "breaching",
  "throwable",
  "medical",
  "utility",
];

export function itemsInSlot(slot: EquipmentSlot): EquipmentItem[] {
  return CATALOG.filter((item) => item.slot === slot);
}

export function itemsForManufacturer(manufacturer: Manufacturer): EquipmentItem[] {
  return CATALOG.filter((item) => item.manufacturer === manufacturer);
}

/** Loadout is a slot → item id map. One item per slot. */
export type Loadout = Partial<Record<EquipmentSlot, string>>;

/** Default loadout for a new player: the free-tier carbine and a plate carrier. */
export const DEFAULT_LOADOUT: Loadout = {
  primary: "vt-carbine",
};

export function isUnlocked(item: EquipmentItem, missionsCompleted: number): boolean {
  return missionsCompleted >= item.unlockAfterMissions;
}

/** Total kit value, used on the armory summary and in the debrief. */
export function loadoutValue(loadout: Loadout): number {
  return Object.values(loadout).reduce((sum, id) => {
    const item = id ? CATALOG_BY_ID[id] : undefined;
    return sum + (item ? item.price : 0);
  }, 0);
}

/** Ammunition and consumables that must be repurchased for the next mission. */
export function perMissionCost(loadout: Loadout): number {
  return Object.values(loadout).reduce((sum, id) => {
    const item = id ? CATALOG_BY_ID[id] : undefined;
    return sum + (item && item.perMission ? item.price : 0);
  }, 0);
}
