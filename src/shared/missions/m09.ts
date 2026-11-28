import type { MissionDef } from "../types";

const m09: MissionDef = {
  id: 9,
  titleKey: "mission.m9.title",
  codenameKey: "mission.m9.codename",
  mode: "MULTI_DECK",
  seed: 95336,
  timeLimitSec: 1500,
  floors: 4,
  weather: "clear",
  timeOfDay: "night",
  darkness: 0.6,
  roeRecommend: "DYNAMIC",
  objectives: [
    { id: "ballroom", key: "Controlled evacuation of ballroom", required: true },
    { id: "decks", key: "Clear decks and cabins", required: true },
    { id: "engineer", key: "Secure engineer in engine room", required: true },
    { id: "suspects", key: "Neutralize all suspects", required: true },
  ],
  outcomes: [
    { id: "SHIP_SECURED_NO_CASUALTIES", key: "outcome.m9.clean", caldwellLineKey: "outcome.m9.clean" },
    { id: "SHIP_SECURED_WITH_CASUALTIES", key: "outcome.m9.casualties", caldwellLineKey: "outcome.m9.casualties" },
    { id: "ENGINEER_LOST", key: "outcome.m9.engineer", caldwellLineKey: "outcome.m9.engineer" },
  ],
  briefingKeys: ["caldwell.brief_m9"],
  intelKeys: ["intel.m9.1"],
  ruleModules: ["crowd_evac"],
  suspects: [
    { name: "Nolan Park", role: "cabins", aggression: 0.65, composure: 0.5, surrender: 0.3 },
    { name: "Terrence Boyd", role: "ballroom guard", aggression: 0.7, composure: 0.55, surrender: 0.25 },
    { name: "Unknown female", role: "engine room", aggression: 0.6, composure: 0.45, surrender: 0.3 },
  ],
  hostages: [{ name: "Ben Ostrowski" }],
  civilians: Array.from({ length: 20 }, () => ({ role: "passenger" })),
};

export default m09;
