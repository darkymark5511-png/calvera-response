import type { Strings } from "./strings";

/**
 * Resolves a translation key against a table. Some keys contain dots as part of
 * the property name ("cmd.holdFire.ack", "roster.ability.reyesDesc"), so the
 * lookup tries whole first, then progressively shorter prefixes.
 */
export function lookup(table: unknown, key: string, values?: Readonly<Record<string, string | number>>): string {
  const resolved = walk(table, key.split("."));
  if (typeof resolved !== "string") return key;
  if (!values) return resolved;
  return resolved.replace(/\{\{(\w+)\}\}/g, (match, name: string) => {
    const value = values[name];
    return value === undefined ? match : String(value);
  });
}

function walk(node: unknown, parts: readonly string[]): unknown {
  if (parts.length === 0) return node;
  if (node === null || typeof node !== "object") return undefined;

  // Longest-first: try the remaining parts joined as a flat key, then split.
  for (let take = parts.length; take >= 1; take -= 1) {
    const flat = parts.slice(0, take).join(".");
    const record = node as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(record, flat)) {
      const next = walk(record[flat], parts.slice(take));
      if (next !== undefined) return next;
    }
  }
  return undefined;
}

/** Convenience wrapper bound to a language table. */
export function translator(table: Strings) {
  return (key: string, values?: Readonly<Record<string, string | number>>): string =>
    lookup(table, key, values);
}
