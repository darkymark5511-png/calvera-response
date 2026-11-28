import en, { type EnKeys } from "./en";
import id from "./id";
import type { Lang } from "../types";

const tables: Record<Lang, Record<EnKeys, string>> = { en, id };

let currentLang: Lang = "en";

export function setLang(lang: Lang): void {
  currentLang = lang;
}

export function getLang(): Lang {
  return currentLang;
}

export function t(key: EnKeys, vars?: Record<string, string | number>): string {
  let s = tables[currentLang][key] ?? tables.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return s;
}

export type { EnKeys };
export { en, id };
