import type { MissionDef } from "../types";
import m01 from "./m01";
import m02 from "./m02";
import m03 from "./m03";
import m04 from "./m04";
import m05 from "./m05";
import m06 from "./m06";
import m07 from "./m07";
import m08 from "./m08";
import m09 from "./m09";
import m10 from "./m10";

export const MISSIONS: MissionDef[] = [m01, m02, m03, m04, m05, m06, m07, m08, m09, m10];

export function getMission(id: number): MissionDef | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export function validateMissions(): string[] {
  const errs: string[] = [];
  if (MISSIONS.length !== 10) errs.push("expected 10 missions");
  const ids = new Set<number>();
  for (const m of MISSIONS) {
    if (ids.has(m.id)) errs.push(`duplicate mission id ${m.id}`);
    ids.add(m.id);
    if (!m.titleKey || !m.codenameKey) errs.push(`mission ${m.id} missing title/codename`);
    if (m.objectives.length === 0) errs.push(`mission ${m.id} has no objectives`);
    if (m.outcomes.length === 0) errs.push(`mission ${m.id} has no outcomes`);
  }
  return errs;
}
