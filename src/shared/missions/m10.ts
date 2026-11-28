import type { MissionDef } from "../types";

const m10: MissionDef = {
  id: 10,
  titleKey: "mission.m10.title",
  codenameKey: "mission.m10.codename",
  mode: "HIGH_VALUE_TARGET",
  seed: 106449,
  timeLimitSec: 1200,
  floors: 3,
  weather: "clear",
  timeOfDay: "night",
  darkness: 0.55,
  roeRecommend: "DYNAMIC",
  objectives: [
    { id: "stair", key: "Secure stairwell", required: true },
    { id: "find", key: "Find Gideon Marsh", required: true },
    { id: "stop_escape", key: "Stop escape to roof", required: true },
    { id: "arrest", key: "Arrest Marsh", required: true },
  ],
  outcomes: [
    { id: "ARREST_CLEAN", key: "outcome.m10.arrest", caldwellLineKey: "outcome.m10.arrest" },
    { id: "ARREST_WITH_CASUALTIES", key: "outcome.m10.casualties", caldwellLineKey: "outcome.m10.casualties" },
    { id: "MARSH_ESCAPED", key: "outcome.m10.escaped", caldwellLineKey: "outcome.m10.escaped" },
    { id: "MARSH_DOWN", key: "outcome.m10.down", caldwellLineKey: "outcome.m10.down" },
  ],
  briefingKeys: ["caldwell.brief_m10"],
  intelKeys: ["intel.m10.1"],
  ruleModules: ["negotiation", "escape"],
  suspects: [
    { name: "Gideon Marsh", role: "HVT", aggression: 0.4, composure: 0.8, surrender: 0.45 },
    { name: "Unknown male", role: "guard", aggression: 0.65, composure: 0.5, surrender: 0.25 },
    { name: "Unknown male", role: "guard", aggression: 0.6, composure: 0.45, surrender: 0.3 },
    { name: "Unknown male", role: "guard", aggression: 0.55, composure: 0.4, surrender: 0.35 },
    { name: "Unknown female", role: "guard", aggression: 0.5, composure: 0.5, surrender: 0.4 },
  ],
  civilians: [{ role: "staff" }, { role: "staff" }],
};

export default m10;
