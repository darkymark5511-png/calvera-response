import type { MissionDef } from "../types";

const m02: MissionDef = {
  id: 2,
  titleKey: "mission.m2.title",
  codenameKey: "mission.m2.codename",
  mode: "HOSTAGE_RESCUE",
  seed: 20833,
  timeLimitSec: 1200,
  floors: 3,
  weather: "rain",
  timeOfDay: "night",
  darkness: 0.9,
  roeRecommend: "DYNAMIC",
  objectives: [
    { id: "find_hostages", key: "Find all hostages", required: true },
    { id: "escort", key: "Escort hostages to loading dock", required: true },
    { id: "secure_suspects", key: "Neutralize or cuff all suspects", required: true },
  ],
  outcomes: [
    { id: "CLEAN_RESCUE", key: "outcome.m2.clean", caldwellLineKey: "outcome.m2.clean" },
    { id: "RESCUE_WITH_INJURIES", key: "outcome.m2.injuries", caldwellLineKey: "outcome.m2.injuries" },
    { id: "RESCUE_PARTIAL", key: "outcome.m2.partial", caldwellLineKey: "outcome.m2.partial" },
    { id: "FAILED", key: "outcome.m2.failed", caldwellLineKey: "outcome.m2.failed" },
  ],
  briefingKeys: ["caldwell.brief_m2"],
  intelKeys: ["intel.m2.1"],
  ruleModules: [],
  suspects: [
    { name: "Victor Lang", role: "leader", aggression: 0.75, composure: 0.6, surrender: 0.2 },
    { name: "Cal Reddick", role: "guard", aggression: 0.65, composure: 0.45, surrender: 0.3 },
    { name: "Troy Mackey", role: "guard", aggression: 0.7, composure: 0.4, surrender: 0.25 },
    { name: "Unknown male", role: "unknown", aggression: 0.5, composure: 0.35, surrender: 0.4 },
  ],
  hostages: [{ name: "Priya Nair" }, { name: "Walter Hughes" }, { name: "Elena Torres" }],
  civilians: [{ role: "hider floor 3" }],
};

export default m02;
