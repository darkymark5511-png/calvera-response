import type { MissionDef } from "../types";

const m07: MissionDef = {
  id: 7,
  titleKey: "mission.m7.title",
  codenameKey: "mission.m7.codename",
  mode: "CROWD_CLEAR",
  seed: 73118,
  timeLimitSec: 1200,
  floors: 2,
  weather: "clear",
  timeOfDay: "night",
  darkness: 0.65,
  roeRecommend: "DYNAMIC",
  objectives: [
    { id: "main", key: "Secure main floor", required: true },
    { id: "evac", key: "Evacuate civilians through front", required: true },
    { id: "vip", key: "Clear VIP lounge and back office", required: true },
    { id: "suspects", key: "Arrest or neutralize all suspects", required: true },
  ],
  outcomes: [
    { id: "CLUB_SECURED_CLEAN", key: "outcome.m7.clean", caldwellLineKey: "outcome.m7.clean" },
    { id: "CLUB_SECURED_WITH_INJURIES", key: "outcome.m7.injuries", caldwellLineKey: "outcome.m7.injuries" },
    { id: "CLUB_SECURED_WITH_CASUALTIES", key: "outcome.m7.casualties", caldwellLineKey: "outcome.m7.casualties" },
    { id: "FAILED", key: "outcome.m7.failed", caldwellLineKey: "outcome.m7.failed" },
  ],
  briefingKeys: ["caldwell.brief_m7"],
  intelKeys: ["intel.m7.1"],
  ruleModules: ["crowd"],
  suspects: [
    { name: "Jorge Salinas", role: "armed", aggression: 0.7, composure: 0.5, surrender: 0.25 },
    { name: "Trent Mayfield", role: "armed", aggression: 0.65, composure: 0.45, surrender: 0.3 },
    { name: "Mia Kessler", role: "armed", aggression: 0.6, composure: 0.55, surrender: 0.35 },
    { name: "Unknown male", role: "armed", aggression: 0.55, composure: 0.4, surrender: 0.35 },
  ],
  civilians: Array.from({ length: 14 }, () => ({ role: "patron" })),
};

export default m07;
