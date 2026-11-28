import type { MissionDef } from "../types";

const m08: MissionDef = {
  id: 8,
  titleKey: "mission.m8.title",
  codenameKey: "mission.m8.codename",
  mode: "WITNESS_EXTRACT",
  seed: 84227,
  timeLimitSec: 1100,
  floors: 2,
  weather: "clear",
  timeOfDay: "night",
  darkness: 0.7,
  roeRecommend: "DYNAMIC",
  objectives: [
    { id: "gate", key: "Breach gate", required: true },
    { id: "find", key: "Find Clara Benton", required: true },
    { id: "extract", key: "Escort to extraction van", required: true },
    { id: "threats", key: "Neutralize threats", required: true },
  ],
  outcomes: [
    { id: "WITNESS_EXTRACTED_CLEAN", key: "outcome.m8.clean", caldwellLineKey: "outcome.m8.clean" },
    { id: "WITNESS_EXTRACTED_INJURED", key: "outcome.m8.injured", caldwellLineKey: "outcome.m8.injured" },
    { id: "WITNESS_LOST", key: "outcome.m8.lost", caldwellLineKey: "outcome.m8.lost" },
  ],
  briefingKeys: ["caldwell.brief_m8"],
  intelKeys: ["intel.m8.1"],
  ruleModules: ["witness"],
  suspects: [
    { name: "Raymond Vaughn", role: "suspect", aggression: 0.7, composure: 0.55, surrender: 0.25 },
    { name: "Silas Crane", role: "suspect", aggression: 0.65, composure: 0.5, surrender: 0.3 },
    { name: "Unknown male", role: "guard", aggression: 0.55, composure: 0.4, surrender: 0.35 },
    { name: "Unknown male", role: "guard", aggression: 0.5, composure: 0.4, surrender: 0.4 },
    { name: "Unknown male", role: "guard", aggression: 0.5, composure: 0.35, surrender: 0.4 },
  ],
  hostages: [{ name: "Clara Benton" }],
};

export default m08;
