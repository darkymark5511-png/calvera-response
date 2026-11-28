import type { MissionDef } from "../types";

const m04: MissionDef = {
  id: 4,
  titleKey: "mission.m4.title",
  codenameKey: "mission.m4.codename",
  mode: "ROBBERY",
  seed: 41255,
  timeLimitSec: 900,
  floors: 2,
  weather: "clear",
  timeOfDay: "night",
  darkness: 0.7,
  roeRecommend: "DYNAMIC",
  objectives: [
    { id: "front", key: "Secure front room", required: true },
    { id: "employees", key: "Secure employees", required: true },
    { id: "alarm", key: "Disable alarm", required: false },
    { id: "vault", key: "Secure vault", required: true },
    { id: "arrest", key: "Arrest suspects", required: true },
  ],
  outcomes: [
    { id: "CLEAN_ARREST", key: "outcome.m4.clean", caldwellLineKey: "outcome.m4.clean" },
    { id: "ARREST_WITH_INJURY", key: "outcome.m4.injury", caldwellLineKey: "outcome.m4.injury" },
    { id: "FAILED", key: "outcome.m4.failed", caldwellLineKey: "outcome.m4.failed" },
  ],
  briefingKeys: ["caldwell.brief_m4"],
  intelKeys: ["intel.m4.1"],
  ruleModules: [],
  suspects: [
    { name: "Kyle Sorensen", role: "robber", aggression: 0.7, composure: 0.45, surrender: 0.3 },
    { name: "Dean Ruiz", role: "robber", aggression: 0.65, composure: 0.4, surrender: 0.35 },
    { name: "Unknown female", role: "lookout", aggression: 0.4, composure: 0.5, surrender: 0.5 },
  ],
  civilians: [{ role: "employee" }, { role: "employee" }, { role: "employee" }, { role: "employee" }],
};

export default m04;
