import { en } from "./en";
import { id } from "./id";
import type { Strings } from "./strings";

export type { Strings };
export type Lang = "en" | "id";

export const DEFAULT_LANG: Lang = "en";

export const STRINGS: Record<Lang, Strings> = { en, id };

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "id";
}
