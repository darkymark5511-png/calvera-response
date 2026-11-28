import type { MissionDef } from "../types";

const m03: MissionDef = {
  id: 3,
  titleKey: "mission.m3.title",
  codenameKey: "mission.m3.codename",
  mode: "BARRICADE",
  seed: 31107,
  timeLimitSec: 1500,
  floors: 1,
  weather: "clear",
  timeOfDay: "dusk",
  darkness: 0.55,
  roeRecommend: "NON_LETHAL",
  objectives: [
    { id: "evac_hall", key: "Evacuate civilians and hold hallway", required: true },
    { id: "resolve", key: "Resolve barricade by surrender or breach", required: true },
  ],
  outcomes: [
    { id: "SURRENDERED_NO_SHOTS", key: "outcome.m3.surrender", caldwellLineKey: "outcome.m3.surrender" },
    { id: "BREACH_SUCCESS", key: "outcome.m3.breach", caldwellLineKey: "outcome.m3.breach" },
    { id: "BREACH_WITH_CASUALTIES", key: "outcome.m3.casualties", caldwellLineKey: "outcome.m3.casualties" },
    { id: "FAILED", key: "outcome.m3.failed", caldwellLineKey: "outcome.m3.failed" },
  ],
  briefingKeys: ["caldwell.brief_m3"],
  intelKeys: ["intel.m3.1"],
  ruleModules: ["negotiation"],
  suspects: [
    { name: "Owen Pratt", role: "barricaded", aggression: 0.55, composure: 0.5, surrender: 0.4 },
    { name: "Jamal Whitaker", role: "barricaded", aggression: 0.6, composure: 0.45, surrender: 0.35 },
    { name: "Unknown male", role: "stairwell", aggression: 0.5, composure: 0.3, surrender: 0.4 },
  ],
  civilians: [{ role: "unit 7E" }, { role: "unit 7E" }, { role: "unit 7E" }],
};

export default m03;
