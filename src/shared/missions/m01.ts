import type { MissionDef } from "../types";

const m01: MissionDef = {
  id: 1,
  titleKey: "mission.m1.title",
  codenameKey: "mission.m1.codename",
  mode: "SEARCH_CLEAR",
  seed: 10421,
  timeLimitSec: 900,
  floors: 2,
  weather: "clear",
  timeOfDay: "night",
  darkness: 0.75,
  roeRecommend: "DYNAMIC",
  objectives: [
    { id: "clear_f1", key: "Clear floor 1", required: true },
    { id: "clear_f2", key: "Clear floor 2", required: true },
    { id: "evidence", key: "Secure three evidence items", required: true },
  ],
  outcomes: [
    { id: "CLEAN_CLEAR", key: "outcome.m1.clean", caldwellLineKey: "outcome.m1.clean" },
    { id: "CLEAR_WITH_INJURIES", key: "outcome.m1.injuries", caldwellLineKey: "outcome.m1.injuries" },
    { id: "FAILED", key: "outcome.m1.failed", caldwellLineKey: "outcome.m1.failed" },
  ],
  briefingKeys: ["caldwell.brief_m1"],
  intelKeys: ["intel.m1.1", "intel.m1.2"],
  ruleModules: [],
  suspects: [
    { name: "Darren Holt", role: "leader", aggression: 0.7, composure: 0.55, surrender: 0.25 },
    { name: "Lucas Peña", role: "lookout", aggression: 0.45, composure: 0.4, surrender: 0.45 },
    { name: "Mick Dorsey", role: "enforcer", aggression: 0.8, composure: 0.5, surrender: 0.15 },
    { name: "Unknown male", role: "unknown", aggression: 0.55, composure: 0.35, surrender: 0.35 },
  ],
  civilians: [{ role: "front desk" }, { role: "guest" }],
};

export default m01;
